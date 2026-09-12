# IA financeira das planilhas do Thiago (WF17)

> Criado em 24/07/2026. **Exclusivo do número 5511910441709** — nenhum outro
> usuário tem as ações no prompt, no executor ou no webhook.

## O que faz

Thiago manda mensagem informal no WhatsApp ("vendi um ozone 15000, bruto
3885, caiu 3215,63") e o sistema lança na célula certa das planilhas reais
dele, com confirmação obrigatória antes de escrever. As 4 planilhas do
manual (`docs/MANUAL-IA-FINANCEIRO.md`) vivem no Postgres em formato xlsx
**zip STORE** (sem compressão — o n8n bloqueia zlib nos Code nodes) na
tabela `giulia_planilhas_fin` (migração 25):

| chave | arquivo | editável |
|---|---|---|
| lojao | Lojão Aquático - Financeiro.xlsx | sim |
| horizon | Horizon - Controle Financeiro.xlsx | sim |
| obras | Controle Financeiro Obras - Thiago Nicezio.xlsx | sim |
| epdm-antigo | EPDM - Gramoterra e Coral Home.xlsx | **não** (espelho) |

## Motor de edição (`services/financeiro/xlsx-patch.js`)

JS puro (só Buffer), roda dentro dos Code nodes do WF17. Lê e escreve
células editando o XML da sheet direto no zip STORE, preservando byte a
byte todo o resto — **fórmulas e gráficos intactos** (openpyxl destruiria
os gráficos do Controle de Obras). Proteções:

- recusa escrever em célula com fórmula, **inclusive células cobertas por
  range de fórmula compartilhada** (furo real achado na revisão
  adversarial: Vendas do Horizon, J44:J75/F44:F75);
- datas viram serial Excel real (epoch 1899-12-30, bug do ano 1900
  tratado) com formato dd/mm/yyyy preservado via atributo `s`;
- rows/células fora de ordem, sem atributo `r`, ou caracteres ilegais de
  XML → aborta em vez de corromper;
- `to_store.py` converte xlsx normal → STORE (usado no registro inicial).

Harness de teste: `node services/financeiro/xlsx-patch.js` (62 casos).

## Fluxo (WF17 `qojjGwPdhIVwcpu3`, webhook giulia-financeiro)

- **planejar**: lê o estado real das 3 planilhas editáveis (ranges do
  manual + primeira linha vazia por tabela), monta prompt com o MANUAL
  embutido → Gemini 3.1 Pro devolve o plano `{chave, escritas, resumo}`.
  O plano passa por **whitelist dura de ranges** + **dry-run do patch**
  (pega fórmula/área proibida na hora) antes de virar pendente em
  `giulia_fin_pendentes`. Resposta: resumo + "Confirma?".
- **aplicar**: revalida, grava backup da versão em
  `giulia_planilhas_fin_versoes` (regra 7 do manual), aplica o patch,
  versao+1, responde listando cada célula escrita e **manda o arquivo
  atualizado no chat**. Nunca inventa totais (fullCalcOnLoad recalcula no
  Excel).
- **cancelar** / **enviar** (arquivo atual) / **consultar** (pergunta
  respondida com os números reais lidos das planilhas, caches de fórmula
  citados com honestidade).

## Integração no WF01

Ações novas (só aparecem no prompt quando `dono_canon === '5511910441709'`,
e o Decidir Acao degrada pra `apenas_responder` se outro dono tentar):
`lancamento_financeiro` (parâmetro `detalhes` = transcrição fiel),
`confirmar_lancamento`, `cancelar_lancamento`, `enviar_planilha_fin`,
`consultar_planilha_fin`. Roteador ganhou o tipo `FINANCEIRO` → nó
"Chamar Financeiro". Node novo "Carregar Fin Pendentes" alimenta a seção
LANCAMENTOS FINANCEIROS AGUARDANDO CONFIRMACAO do prompt. Mensagens
financeiras do Thiago vão pro modelo Pro (keywords no roteador híbrido).
Gasto pessoal continua no `registrar_gasto` de sempre.

## Gate de acesso (3 camadas, testado)

1. Prompt: outros donos nem veem as ações.
2. WF01 Decidir Acao: `donoCanon !== '5511910441709'` → degrada.
3. WF17 Preparar Fin: `dono !== '5511910441709'` → `return []` (para
   antes de qualquer load/LLM/envio).

## Bateria de 24/07 (15/15 + 3 gates)

Gates diretos (João AA, dono vazio, número formatado) → pararam no
Preparar Fin. Ponta a ponta: venda Lojão linha 31 (data real dd/mm/yyyy,
sequencial 20, fórmulas H-L intactas), aporte André linha 24, **regra 2×
Horizon** (despesa + aporte no mesmo plano), recebimento Itu (D15+G15,
2 gráficos do Resumo Geral intactos), cancelamento sem tocar arquivo,
envio de arquivo, consulta com números reais (caixa 29.012,55 / Coral
Home 95.000 / saldo André 87.100,90), falta de dado → pergunta sem
pendente, comissão Gramoterra → escreve E15 e **avisa** que B17 é fórmula,
gasto pessoal não vira financeiro, João AA pedindo "lança no lojão" não
toca o WF17. Depois da bateria: planilhas restauradas pro estado original
(v1), memória/gasto/recebível de teste apagados.

## Operação

- Atualizar uma planilha manualmente: converter com
  `python3 services/financeiro/to_store.py in.xlsx out.xlsx` e dar
  UPDATE em `giulia_planilhas_fin.arquivo_b64` (base64), versao=1.
- Voltar versão: restaurar `arquivo_b64` de
  `giulia_planilhas_fin_versoes` (backup automático de cada edição).
- Célula que o manual manda atualizar mas é fórmula (ex.: B17 do EPDM
  Gramoterra): o sistema escreve o que pode e avisa — ajuste manual.

## Correções de 31/07 (auditoria da 1ª semana de uso real)

- **Resumo nunca mais sai vazio** no "Confirma?": se o planejador não mandar
  resumo, o sistema sintetiza um a partir das escritas (bug real: o plano do
  frete internacional de 27/07 chegou pro Thiago sem descrição).
- **Toda resposta do WF17 agora entra em `giulia_memoria`** (plano, consulta,
  aplicação, cancelamento). Antes o WF01 não "lembrava" do que o módulo
  financeiro tinha dito — causa da conversa confusa de 27/07.
- **Follow-up de pendentes** (migração 26, `lembrado_em`): o WF14 lembra o
  Thiago 1×/dia de lançamento aguardando confirmação há 20h+ e cancela com
  aviso após 7 dias. Bug real: o lançamento do frete ficou 4 dias parado em
  silêncio.
- WF01: cap de ações extras por mensagem subiu de 3 pra 9 (lista de 10
  tarefas perdia 2 em silêncio) e `adiar_tarefa` entrou na whitelist de
  ações em lote ("É para hoje" só mudava o prazo de 1 tarefa).


## Atualização do manual — 20/08/2026 (v2)

Manual mestre substituído (`docs/MANUAL-IA-FINANCEIRO.md`) e re-embutido no
WF17. Mudanças estruturais:

- **5 planilhas** (eram 4): entram `Horizon Paraguai - Financeiro.xlsx`
  (3 sócios 30/30/40, base US$) e `Financeiro Pessoal - Thiago.xlsx`
  (Entradas/Saídas/Dívidas). `EPDM - Gramoterra e Coral Home.xlsx` passa a
  OBSOLETO oficial.
- **Horizon Brasil**: saldo devedor agora é **equalização 50/50**
  ((aportes André − aportes Thiago) ÷ 2 − devolvido), câmbio 5,20,
  contabilidade 250/mês, `Acerto Sócios` **B20** (era B18).
- **Obras**: aba **Rei dos Motores** no lugar de "Obra em Branco 2";
  cronograma com E21:E23 e resultado I56:I64.
- FIN_CONFIG reescrito com as zonas de leitura/escrita das 5 planilhas
  (Paraguai: Aportes 12–56, Despesas 12–61; Pessoal: Entradas 12–111,
  Saídas 12–211, Dívidas 12–41 com C/G fórmulas).

### Controle de versão da cópia (migração 31)

Coluna `giulia_planilhas_fin.defasada`. Quando o Thiago edita a planilha
por fora, a cópia do sistema fica marcada e:
- o prompt recebe um **inventário de arquivos** (registrado/em dia,
  registrado/defasado, não recebido);
- o plano sai com aviso de defasagem e a aplicação avisa de novo;
- arquivo do manual ainda não recebido → resposta clara pedindo o .xlsx,
  em vez de erro técnico.

Estado em 21/08: lojao, horizon e obras marcados **defasados**; paraguai e
pessoal **não recebidos**. Teste real confirmou: a IA já usa a regra nova
de equalização, mas com os números da cópia velha — só o reenvio dos
arquivos fecha a lacuna.


## Upload de planilha pelo WhatsApp (21/08)

Fecha o ciclo: o Thiago edita as planilhas no computador e agora **manda o
.xlsx no WhatsApp** — a assistente registra sozinha.

- **`services/financeiro/inflate.js`**: INFLATE (RFC 1951) em JS puro —
  stored/fixed/dynamic Huffman, back-reference sobreposta, data descriptor.
  Existe porque o Excel salva xlsx com DEFLATE e o n8n bloqueia `zlib`.
  `converterParaStore()` transforma o xlsx do Excel no formato STORE que o
  motor de edição exige. Validação: 3.456 casos contra o `zlib` nativo
  (0 divergências), 200 zips (10 níveis × 5 estratégias), conteúdo byte a
  byte vs gabarito Python, CRC contra o header original, openpyxl
  (fórmulas + gráficos), sandbox sem require/fs/zlib, 6 casos de corrupção.
  Tempo: 2–3 ms nos arquivos reais, 46 ms num de 5 MB.
  **Verificação cruzada independente** (Python zipfile + openpyxl, fora do
  harness do autor): 4/4 arquivos idênticos, 0 células divergentes.
- **WF17 modo `registrar`**: recebe base64, converte para STORE, **detecta
  qual das 5 planilhas é pelas abas** (≥60% de match; a legenda do Thiago é
  só desempate), guarda backup da versão anterior, faz upsert com
  `defasada = false` e responde com abas encontradas/faltando.
- **WF01 ação `atualizar_planilha_fin`**: pega o binário da mensagem
  (best-effort, sem mexer na topologia do ramo de planilha para não afetar
  a importação do CRM), roteia como FINANCEIRO modo registrar. Sem arquivo
  na mensagem, responde pedindo o documento em vez de chamar o WF17.

Teste real: `lojao.xlsx` comprimido (22 KB base64) → registrado em 8 s,
5/5 abas, backup criado, fórmulas e gráfico preservados no que ficou no
banco. Estado de teste revertido depois (as 3 seguem marcadas defasadas).
**Não testado ainda**: a extração do binário de uma mensagem real do
WhatsApp (depende do primeiro envio do Thiago) — se vier vazia, a resposta
já orienta a reenviar como documento.
