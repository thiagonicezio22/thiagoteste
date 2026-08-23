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
