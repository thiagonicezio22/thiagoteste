# Email do Thiago pela assistente (WF18)

> Criado em 07/08/2026. Caixa: **contato@thiagonicezio.com** (Hostinger,
> MX mx1/mx2.hostinger.com). Exclusivo do número 5511910441709.

## Recebimento (IMAP → WhatsApp)

WF18 `NNUd29aBLloX72to` fica plugado na caixa (imap.hostinger.com:993,
credencial n8n "Email Thiago IMAP"). Cada email novo: grava em
`giulia_emails` (dedupe por message_id), avisa o Thiago no WhatsApp
(remetente + assunto + trecho + "quer que eu responda?") e registra na
memória da conversa — a assistente usa esses emails de contexto pra
redigir respostas. Emails com mais de 36h (não-lidos antigos na
ativação) são guardados sem notificar.

## Envio (WhatsApp → SMTP, com confirmação)

Ações no WF01, só pro Thiago (mesmo gate de 3 camadas do financeiro):
- `enviar_email`: a IA redige o email completo (assinatura Thiago
  Nicezio), grava em `giulia_email_pendentes` e mostra o PREVIEW
  determinístico ("📧 Email pronto: Para/Assunto/corpo. Confirma o
  envio?"). Nada sai sem o "confirma".
- `confirmar_email`: WF01 → webhook `giulia-email` → SMTP
  (smtp.hostinger.com:465, credencial "Email Thiago SMTP") → marca
  enviado + memória + "📤 Email enviado ✅" no WhatsApp.
- `cancelar_email`: descarta o pendente.

Webhook `giulia-email` tem gate duro (dono ≠ Thiago → para na 1ª linha).

## Teste de 07/08 (ponta a ponta real)

"manda um email de teste pra contato@..." → preview correto → "confirma"
→ SMTP enviou → o mesmo email voltou pela caixa → IMAP disparou → aviso
no WhatsApp + `giulia_emails.notificado=true` + pendente `enviado`.
Gate negativo (dono João AA no webhook) → bloqueado no Preparar Envio.

## Operação

- Senha da caixa: `giulia_config` (chave GIULIA_EMAIL_SENHA) + `.env`.
- Trocar senha: atualizar as DUAS credenciais no n8n (IMAP
  SPlSrP20IjwICGGH, SMTP jCec0J7EjuErLvg7) e a `giulia_config`.
- Migração 28: `giulia_emails` + `giulia_email_pendentes`.


## Histórico de emails (listar_emails, 10/08)

Ação `listar_emails` (só Thiago): lê `giulia_email_pendentes` (enviados)
e `giulia_emails` (recebidos) e devolve a lista real — destinatário/
remetente, assunto, data (SP). Parâmetros `tipo` (enviados|recebidos|
todos; padrão enviados) e `periodo` (hoje|semana|mes|tudo). Muitos
gatilhos no prompt ("puxa o histórico de emails", "que emails mandei",
"meus emails"...) porque o pedido do Thiago não casava com nenhuma ação.
Gate: outro dono recai em apenas_responder. Testado com 4 formulações +
recebidos + gate. Registros de teste antigos (assuntos "Teste da
assistente"/"Visual novo"/"Formatação e acentuação"/"Urgent: Fiber
boxes...") removidos do log de enviados para não poluir o histórico real.


## Anexos dos emails (23/08) — o que quebrou e o que mudou

**Falha real, 23/08 12:31.** Thiago pediu "Quero o anexo do e-mail você
consegue enviar ?" (sobre o email da Mobenfilm que ela tinha acabado de
traduzir) e a assistente respondeu *"Consigo sim. Vou pegar o PDF da
invoice que o Kip mandou e já te envio aqui."* — dois erros no mesmo
recado: contexto trocado (Kip/invoice em vez de Mobenfilm/catálogo) e
uma promessa impossível. Nada foi enviado, porque **anexo não existia no
sistema**: o IMAP não baixava, não havia tabela pra guardar e o WF01 não
tinha ação nenhuma de anexo. Ela prometeu porque o prompt não dizia que
aquilo estava fora do alcance dela.

**Correção (migração 32 + WF18 + WF01).**

- `giulia_email_anexos` (email_id, nome, mime, tamanho, conteudo_b64).
- **WF18**: IMAP com `downloadAttachments: true`; `Preparar Email
  Recebido` lê o binário com `await this.helpers.getBinaryDataBuffer()`
  — o n8n guarda binário **fora da memória** e `binary.data.data` vinha
  com 10 bytes de referência (bug real do 1º teste). Descarta referência
  quebrada (<20 bytes) em vez de gravar lixo. Limite de 15 MB pra
  guardar; acima disso só cita o nome. O aviso no WhatsApp lista os
  anexos e avisa que dá pra pedir o arquivo.
- **WF01 `enviar_anexo_email`** (só Thiago, mesmo gate de 3 camadas):
  busca por `remetente_match`/`assunto_match`, manda o documento pela
  UAZAPI `/send/media`. Sem anexo guardado, responde a verdade: *"Não
  achei anexo guardado pra esse email. Só consigo reenviar anexos de
  emails que chegaram a partir de 23/08..."*. O prompt agora carrega essa
  regra de honestidade, pra ela não prometer arquivo que não tem.
- O ramo ANEXO é **terminal**: manda UM recado só (o documento com
  legenda **ou** o aviso honesto) e grava na `giulia_memoria` o que foi
  realmente enviado, via nó `Memoria Anexo`. Antes o `Responder UAZAPI`
  ainda mandava um "deixa eu procurar esse anexo" **depois** do arquivo.

**Validação (23/08).** SMTP → IMAP → base64 → Postgres → WhatsApp com PDF
de 404 bytes: sha256 idêntico nas duas pontas (`053d8333839f2a7f`), e a
própria UAZAPI devolveu `fileLength: 404` + `fileSHA256` batendo com o
original. Ramo "não achei" testado com o email da Mobenfilm (sem anexo
guardado). Gate: outro dono / dono vazio / número formatado → todos caem
em `apenas_responder`. Injeção de SQL na busca (`'; DROP TABLE
giulia_emails; --`) escapada — tabela intacta. Regressão no ramo normal
(listar_lembretes) OK. Rastros de teste apagados (emails, anexos e 14
linhas de memória).

**Limite honesto:** email que chegou antes de 23/08/2026 não tem anexo
guardado — inclusive o da Mobenfilm que gerou a reclamação. Pra esses, a
saída é pedir reenvio ao remetente.


## Bug do `$N` — e-mails perdidos em silêncio (achado em 04/09)

**Sintoma:** `giulia_erros_log` com "erro desconhecido" no WF18 (2× em 25/08,
3× em 02/09). Os dois de 25/08 ainda estavam nas execuções do n8n: nó
`Salvar Email`, erro *"Variable $43496650 exceeds supported maximum of
$100000"*. E-mails perdidos (não salvos, não avisados): **Somatec RH
"PROT 8391: FECHAMENTO 08/2026"** e **Nicole/Blue Thumb "Invoice/Tracking
info"** (25/08); os 3 de 02/09 não têm mais execução guardada.

**Causa:** o nó Postgres do n8n (pg-promise) trata `$<número>` dentro do
SQL como placeholder de parâmetro. Message-ID no padrão Outlook
(`<01aa01dd34bd$43496650$c9dc32f0$@dominio>`) sempre carrega `$` + 8
dígitos → estoura o máximo e derruba o INSERT inteiro. Valores pequenos
(`$0.00`, `$324.46`) passam; só `$` + número > 100000 quebra — por isso
ficou invisível até um remetente com Outlook aparecer.

**Correção:** o `esc()` dos 4 Code nodes do WF18 e dos 2 gravadores de
memória do WF01 (`Montar SQL Memoria`, `Memoria Anexo`) agora quebra o
literal em `'...' || '$' || '43496650...'` — o Postgres concatena e o valor
gravado é idêntico (verificado byte a byte). Cuidado ao replicar: em JS,
`$'` dentro da string de replace significa "texto após o match" — tem que
ser `'$$'`. Testado ao vivo com e-mail contendo `$43496650`, `$0.00`,
`$324.46` e `$1500000`: salvou intacto, avisou no WhatsApp, 0 erros.

**Recuperar os perdidos:** no webmail, marcar os e-mails como *não lidos* —
o IMAP busca só UNSEEN, então ele reprocessa e salva com o fix. Resíduo
conhecido: outros nós do WF01 que embutem texto livre em SQL (tarefas,
ideias, gastos) ainda usam o `esc()` antigo; só quebrariam com `$` + 6
dígitos na descrição.


## Lote do IMAP — e-mails perdidos em silêncio, parte 2 (04/09)

Ao recuperar os e-mails do bug do `$N`, apareceu um segundo furo: o IMAP
entrega **vários e-mails numa execução só** quando chegam perto um do outro
(ou na ativação do workflow), e `Preparar Email Recebido` lia só `items[0]`.
Os demais sumiam sem erro. Caso real: 3 respostas da VIVOSUN entre 27 e
29/08 nunca foram salvas nem avisadas. Um terceiro furo veio no teste do
lote: `Gravar Anexos` (INSERT sem RETURNING) não devolve item quando há
outros itens no lote, e o e-mail **com anexo** saía do fluxo antes do
`Notificar?` — anexo guardado, aviso nunca enviado.

**Correções (WF18):**
- `Preparar Email Recebido` faz loop por item (`getBinaryDataBuffer(idx, k)`,
  `pairedItem`); `Preparar Anexos` e `Pos Notificacao` rodam
  `runOnceForEachItem` com `.item` em vez de `.first()`; `Notificar?` e
  `Avisar Thiago Email` idem.
- `Gravar Anexos` agora é `INSERT ... RETURNING email_id` — sempre sai um
  item.

**Validação:** WF18 desligado → 3 e-mails enviados (um com `$43496650`, um
com PDF) → religado → 1 execução com 3 itens: 3 salvos, 1 anexo, 3 avisos.
Repetido com 2 (PDF primeiro): 2/2 avisados. 0 erros no `giulia_erros_log`.

**Recuperação feita:** clone temporário do caminho de captura com
`customEmailConfig = [["SINCE","25-Aug-2026"]]` (critério com argumento é
array **aninhado** — `["SINCE","..."]` plano falha em silêncio) e
`postProcessAction = nothing`. O gatilho IMAP só busca no evento de e-mail
novo, então foi preciso mandar um e-mail pra caixa pra disparar. Leu 36,
inseriu 5 (dedup por `message_id`): **Somatec "FECHAMENTO 08/2026"** (2
PDFs: Recibo de Pagamento e Extrato Mensal), Nicole/Blue Thumb e 3
VIVOSUN. Caixa desde 25/08 = 27 reais; banco = 27. Clone apagado.
Os 3 "erro desconhecido" de 02/09 não têm e-mail correspondente na caixa
(provável falha de envio/aviso, não de recepção) — sem trace pra recuperar.
