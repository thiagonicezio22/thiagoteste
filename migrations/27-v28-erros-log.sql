-- v28: log proprio de erros de workflow (para o Error Handler agrupar rajadas)
CREATE TABLE IF NOT EXISTS giulia_erros_log (
  id        SERIAL PRIMARY KEY,
  workflow  TEXT NOT NULL,
  node      TEXT,
  mensagem  TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_erros_log_wf ON giulia_erros_log (workflow, criado_em);
