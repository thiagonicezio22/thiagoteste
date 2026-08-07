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
