-- v33: anexos dos emails recebidos (para reenviar no WhatsApp)
CREATE TABLE IF NOT EXISTS giulia_email_anexos (
  id           SERIAL PRIMARY KEY,
  email_id     INT REFERENCES giulia_emails(id) ON DELETE CASCADE,
  nome         TEXT NOT NULL,
  mime         TEXT,
  tamanho      INT,
  conteudo_b64 TEXT NOT NULL,
  criado_em    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_anexos_email ON giulia_email_anexos (email_id);
