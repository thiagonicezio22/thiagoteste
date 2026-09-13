# Feature: Orçamentos em PDF a partir de modelo PowerPoint

> Especificação fechada com o Thiago em 05/07/2026.
> **Status 12/07: NO AR.** O Thiago liberou converter o próprio PDF de
> exemplo em modelo ("vou enviar depois o ppt ou voce converte ele, quero
> que voce faça tudo"). O modelo foi reconstruído a partir do PDF e o fluxo
> completo está em produção — pedido por chat → RESUMO → confirma → PDF no
> WhatsApp do dono → registro ORC-YYYY-NNN → follow-up em 3 dias.
> Bateria de 26 verificações reais: todas passaram.

## Como ficou implementado (v1 em produção)

- **Template "visual"**: cada página do modelo virou uma imagem JPEG
  (2000px; textos variáveis removidos das págs 1/6/9 e marcador EXEMPLO
  apagado) + um layout spec (`services/orcamentos/templates/
  ambiente-aquatico.layout.json`) que define onde cada campo é desenhado
  (fonte, tamanho, cor, alinhamento, shrink-to-fit, wrap, cards opcionais).
- **Geração DENTRO do n8n** (sem depender de container novo):
  `services/orcamentos/pdf-writer.js` — gerador de PDF em JS puro (fontes
  base-14 + tabelas AFM, WinAnsi com acentos, JPEG embutido) — roda num
  Code node do WF12. Determinístico, revisado adversarialmente.
- **WF12 "Orcamentos PDF"** (webhook `giulia-orcamento`): claim do pendente
  → INSERT em giulia_orcamentos com número sequencial por dono/ano →
  monta o PDF → UAZAPI /send/media pro DONO → marca pendente processado +
  memória.
- **WF13 "Orcamentos Followup"** (cron horário): às 10h locais do dono,
  orçamentos gerado/enviado há 3+ dias sem atualização → pergunta ao dono
  ('aprovou'/'recusou' atualiza via atualizar_orcamento_status). Webhook
  de teste: `giulia-orcamento-followup-tick` com `{force: numero}`.
- **WF01**: 4 ações novas (gerar_orcamento com RESUMO obrigatório,
  confirmar_orcamento, cancelar_orcamento, atualizar_orcamento_status),
  2 loaders (template do dono + orçamentos pendentes/recentes), branch
  ORCAMENTO no roteador.
- **Micro-serviço python-pptx + LibreOffice** (`services/orcamentos/`):
  continua pronto como caminho alternativo para quando clientes mandarem
  PPTX próprios complexos — o `.pptx` oficial do modelo piloto
  (`templates/ambiente-aquatico.pptx`, gerado por `build_template.py`)
  já está marcado com os placeholders e validado. Deploy no EasyPanel
  segue opcional (README do serviço).

## Decisões (definidas pelo Thiago)

1. **Entrega**: o PDF gerado vai SEMPRE para o próprio usuário (dono) repassar
   ao cliente final dele. REGRA DE OURO: o assistente NUNCA conversa com
   números que não foram cadastrados pelo Thiago — sem exceção.
2. **Modelo**: cada cliente do sistema tem seu modelo de orçamento padrão em
   PowerPoint (a marca/layout dele). O Thiago envia o PPT; nós marcamos os
   campos variáveis e instalamos vinculado ao número do cliente.
3. **Escopo v1**: gerar o orçamento (+ registro mínimo para follow-up).
   Follow-up é SEMPRE com o próprio dono ("teu orçamento pra Dona Ana está há
   X dias sem resposta — teve retorno?"), nunca com o cliente final.
4. **Piloto**: modelo real que o Thiago vai enviar.

## Fluxo v1

1. Dono manda por texto/áudio: "faz um orçamento pra Dona Ana: banho e tosa
   mensal, 4 visitas, 320 reais, validade 15 dias".
2. IA extrai os campos e responde com RESUMO para confirmação obrigatória
   (orçamento errado na mão de cliente final custa caro).
3. Dono confirma → serviço preenche o PPT do modelo dele → converte em PDF →
   envia o PDF no WhatsApp do dono.
4. Orçamento registrado: número sequencial por dono (ex: ORC-2026-001),
   cliente final (nome), valor, data, status inicial "gerado".
5. Follow-up: após N dias sem atualização de status, o assistente pergunta ao
   dono se teve resposta; "aprovou" / "recusou" atualiza o status.
   (Aprovado → gancho futuro para contas a receber.)

## Arquitetura

- **Micro-serviço "orcamentos"** (container próprio no EasyPanel, isolado do
  resto): recebe `{template_id, campos, itens[]}` → preenche o PPTX
  (python-pptx) → converte em PDF (LibreOffice headless) → devolve o PDF.
- **n8n**: nova ação `gerar_orcamento` no pipeline (com confirmação em duas
  etapas, padrão enviar_com_confirmacao) + chamada HTTP ao serviço + envio do
  PDF via UAZAPI /send/media (base64, como a planilha).
- **Banco**: `giulia_orcamento_templates` (dono, nome, campos do modelo,
  arquivo) e `giulia_orcamentos` (dono, numero seq, cliente_final, valor,
  status, criado_em).
- **Placeholders no PPT**: convenção `{{campo}}` (ex: `{{cliente}}`,
  `{{descricao}}`, `{{valor}}`, `{{validade}}`, `{{data}}`, `{{numero}}`).
  Tabela de itens com linhas dinâmicas se o modelo tiver.

## Materiais necessários do Thiago (para iniciar)

1. ~~O arquivo PPT do modelo piloto.~~ → chegou o PREVIEW EM PDF (mapeado
   no Anexo abaixo). **Ainda falta o .pptx original** — PDF não dá para
   preencher programaticamente; o preenchimento é feito no PowerPoint.
2. Se possível, 1–2 orçamentos reais já preenchidos desse modelo (para
   identificar exatamente o que varia de um orçamento pro outro).
3. Prazo do follow-up: adotado o padrão de **3 dias** sem resposta →
   assistente pergunta ao dono. Ajustável por conversa depois.

## Anexo: modelo piloto — Ambiente Aquático (lagos e piscinas naturais)

Preview de 11 páginas recebido em 12/07. Mapa fixo × variável:

| # | Slide | Tipo | Campos |
|---|---|---|---|
| 1 | Capa "Proposta Comercial" | VARIÁVEL | `{{cliente}}`, `{{mes_ano}}` |
| 2 | Quem Somos | fixo | — |
| 3 | Nossos serviços (6 cards) | fixo | — |
| 4 | Portfólio | fixo | — |
| 5 | Como funciona (4 passos) | fixo | — |
| 6 | Opção de projeto (detalhe) | VARIÁVEL | `{{projeto_titulo}}`, `{{projeto_descricao}}`, `{{volume}}`, `{{estilo}}`, `{{execucao}}`, `{{investimento}}` |
| 7 | Visualização do projeto (fotos + 2 destaques) | fixo na v1 | fotos por projeto ficam para v2 |
| 8 | O que está incluso (8 itens chave na mão) | fixo | — |
| 9 | Investimento (até 3 cards de opção) | VARIÁVEL | `{{opcaoN_titulo}}`, `{{opcaoN_sub}}`, `{{opcaoN_valor}}` (N=1..3; cards 2 e 3 com `opt:` — somem se o orçamento tiver menos opções) |
| 10 | Dúvidas frequentes (4 FAQ) | fixo | — |
| 11 | CTA final (WhatsApp) | fixo | — |

Observações de marcação (fazer quando o .pptx chegar):
- Slide 6 detalha a opção principal. Se orçamentos com 2–3 opções pedirem
  detalhe de cada uma, duplicar o slide 6 no modelo com `{{opt-slide:...}}`.
- O modelo não mostra número do orçamento nem validade. Sugerir ao Thiago
  uma linha discreta na capa ou no slide 9: "Proposta ORC-2026-001 · válida
  até DD/MM" (`{{numero}}`, `{{validade}}`) — profissionaliza e habilita o
  follow-up por validade.
- Fontes do modelo (serifada tipo Lorimer/Playfair no título) devem ir em
  `services/orcamentos/fonts/` para o PDF sair idêntico.
