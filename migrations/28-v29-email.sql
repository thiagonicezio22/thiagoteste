-- v29: modulo de email do Thiago (contato@thiagonicezio.com)
-- giulia_emails: todo email recebido fica consultavel pela assistente
-- giulia_email_pendentes: envio SO com "confirma" do Thiago (email e externo)

CREATE TABLE IF NOT EXISTS giulia_emails (
  id           SERIAL PRIMARY KEY,
  de           TEXT NOT NULL,
  de_nome      TEXT,
  assunto      TEXT,
  corpo        TEXT,
  recebido_em  TIMESTAMP NOT NULL DEFAULT NOW(),
  notificado   BOOLEAN NOT NULL DEFAULT false,
  message_id   TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_emails_msgid ON giulia_emails (message_id) WHERE message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS giulia_email_pendentes (
  id           SERIAL PRIMARY KEY,
  destinatario TEXT NOT NULL,
  assunto      TEXT NOT NULL,
  corpo        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pendente',  -- pendente | enviado | cancelado
  criado_em    TIMESTAMP NOT NULL DEFAULT NOW(),
  resolvido_em TIMESTAMP
);
