# Handoff para a sessão ENG / Julian (09/11/2026)

> Escrito pela sessão GIULIA (Claude) a pedido do Thiago. Sem chaves ou senhas
> neste arquivo. Branch: `claude/whatsapp-virtual-assistant-bDR9r`.

## 1. O que aconteceu

- **08/11, entre 10:00 e 20:47 UTC:** a conta de cobrança do Google AI Studio
  ficou com saldo devedor. Desde então, toda chamada ao Gemini volta
  `HTTP 403 "Your billing account has an outstanding balance"`. A tela de
  Faturamento mostra "tipo de conta de faturamento inativo".
- Testei em 09/11 as **duas chaves Gemini em uso** no n8n. As duas caem na mesma
  conta e as duas estão bloqueadas.
- O WF01 da Giulia marca a execução como `success` mesmo quando a IA falha.
  Por isso nenhum alerta saiu. Os sistemas de vocês podem ter o mesmo ponto cego.

## 2. O que está parado (usa Gemini)

| Sistema | Workflows ativos afetados |
|---|---|
| Julian | `04 - Pipeline Principal Julian` (nó "IA Julian"), `17 - Checklist Semanal Julian`, `18 - Monitor Atendimento Vendedor` |
| Relatórios | `19a` Leticia, `19b` Thiago Bio, `19c` Beatriz, `19d` Elaine, `19e` Felipe, `19f` Marcia, `22 - Resumo Executivo Antonio` |
| Horizon | `HZ - Lauren Pipeline v2`, `HZ - Lauren Chatwoot v2` (atendem clientes) |
| Mercado Livre | `25 - ML Perguntas Lojao Aquatico` |

O Julian, os relatórios e o ML chamam o endpoint compatível com OpenAI do
Google (`generativelanguage.googleapis.com/v1beta/openai/chat/completions`)
com `Authorization: Bearer AQ...` **escrito direto no nó ou no Code node**.
O WF25 tem `GEMINI_KEY = 'AQ...'` no código.

**Segurança:** em 09/11 essas chaves `AQ...` apareceram em texto puro na saída
de comandos da sessão GIULIA. Não foram para o GitHub. Recomendação: gerar
chaves novas ao reativar o Google e guardá-las em **credencial do n8n**, não
no código.

## 3. O que a Giulia fez: migrou para Claude Opus 5.5 (no ar desde 09/11)

Decisão do Thiago depois de um teste com 28 casos (12 mensagens reais, 16
cenários; só leitura, nada enviado):

- 28/28 respostas em JSON válido, com ação escolhida.
- Resolveu "Bisbi 1" → Bixby I e "Búfalo Médio" → Bufalo tamanho Medium.
- Desconto de 18% visível no item.
- Admitiu o que não consegue fazer em vez de fingir.
- Tempo médio de 6,4 s, de 1,4 a 15 s.

**Padrão usado (copiável):** em cada workflow, sem mexer no resto da lógica:

1. Code `Para Claude` (por item): converte o `gemini_body`
   (systemInstruction/contents/inline_data) para o corpo da Messages API.
   - `model: claude-opus-5-5`, `max_tokens` = 2× o antigo (mínimo 4000).
   - `output_config.effort`: medium ou low.
   - `fallbacks: "default"` com header `anthropic-beta: server-side-fallback-2026-07-01`.
   - Imagem vira bloco `image` e PDF vira `document`.
   - Não há suporte a áudio. Na Giulia o áudio já passa antes pelo Whisper (OpenAI).
2. HTTP Request `POST https://api.anthropic.com/v1/messages` com
   **credencial n8n tipo `anthropicApi`**, nome "Anthropic account", id
   `FiTDzqlKTWNbybxI`. O id não é segredo; a chave fica só na credencial.
   Headers: `anthropic-version: 2023-06-01`.
3. Code `Resposta Claude`: devolve no formato
   `candidates[0].content.parts[0].text` + `finishReason`
   (`end_turn` vira `STOP`, `refusal` vira `SAFETY`), para o parser antigo continuar igual.

Para vocês, que usam chat/completions (formato OpenAI), a conversão é parecida:
`messages[role=system]` vira `system`, o resto vira `messages`, e
`choices[0].message.content` sai de `content[].text`.

Código de referência: `workflows/01-GIULIA-Pipeline.json` (nós "Para Claude",
"IA Giulia (Claude)" e "Resposta Claude"). Também `04`, `17` e `22`.
Monitor: `workflows/24-GIULIA-Monitor-IA.json` faz um ping a cada 15 min e avisa o
Thiago se acabarem os créditos ou a chave falhar.

## 4. Custos (para decidir o Julian)

- **Fatura Gemini:** R$ 331 em 28 dias (13/10 a 09/11), uns US$ 60. É a conta
  inteira: Giulia, Lauren, Julian, relatórios e ML.
  - Cerca de US$ 15 a 20 disso era desperdício de um bug no WF22 da Giulia, já corrigido.
  - Ele chamava o Gemini a cada 10 min com prompt vazio.
- **Preços por milhão de tokens:**
  - Gemini 3.1 Pro: US$ 2 / 12.
  - Gemini 3.5 Flash: US$ 1,50 / 9.
  - Claude Opus 5.5: US$ 4 / 20. Leitura em cache: US$ 0,20.
- **Medido na Giulia (Opus 5.5):** prompt de ~33 mil tokens, saída de ~560
  tokens, **US$ 0,14 por mensagem sem cache**.
- **Estimativa para o sistema inteiro no Opus:** US$ 80 a 115/mês sem otimizar,
  US$ 50 a 80 com cache do prompt. Para o número exato, use AI Studio → **Uso**,
  separado por modelo, 28 dias. O n8n não guarda as execuções bem-sucedidas desses
  workflows (`saveDataSuccessExecution: none`), então não dá para medir por lá.

## 5. Pendências que encostam em vocês

- **WF20 Sync Catálogo Horizon** falhou 2×/dia de 02/11 a 08/11 com
  `duplicate key hz_catalogo_variant_id_key`, variant 44165277024359. O catálogo
  ficou parado em 02/11.
  - **Causa:** a Shopify renomeou o SKU do Onyx Medium de `HP-ONYX-SM` para
    `HP-ONYX-MD`. O upsert faz `ON CONFLICT (sku)`, então tentou inserir uma linha
    nova e bateu no `UNIQUE(variant_id)`.
  - **Corrigido nos dados em 09/11:** `UPDATE hz_catalogo SET sku='HP-ONYX-MD'`
    nessa linha. Era o único caso: comparei os 122 variants do feed com o banco.
    Nenhuma invoice nem rascunho usava o SKU antigo. Backup em
    `hz_catalogo_bak_onyx_20261109`.
  - **Para não repetir (no gerador, `calc-invoice.js`/`lib-wf`, fora do repo):**
    antes do INSERT, rodar
    `UPDATE hz_catalogo c SET sku = v.sku FROM (VALUES ...) v WHERE c.variant_id = v.variant_id AND c.sku <> v.sku`,
    para que um SKU renomeado na Shopify vire rename e não duplicata.
- `docs/HANDOFF-INVOICE-2026-11-03.md`: mudanças no WF19 e no WF01 que a sessão
  do invoice precisa levar para os fontes.
- **n8n:** a senha do dono foi resetada em 09/11 (o Thiago trocou). Ativar a
  verificação em 2 etapas em Settings → Personal.
