-- Giulia v6 - tarefas/obrigacoes com follow-up

CREATE TABLE IF NOT EXISTS giulia_tarefas (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo DATE,                       -- opcional, dia limite
  status TEXT NOT NULL DEFAULT 'pendente',
    -- pendente | feita | cancelada
  criada_em TIMESTAMP DEFAULT NOW(),
  ultima_cobranca_em TIMESTAMP,
  proxima_cobranca_em TIMESTAMP,    -- quando o cron deve cobrar
  feita_em TIMESTAMP,
  cobranca_count INT DEFAULT 0,
  ultima_msg_giulia TEXT             -- texto da ultima cobranca enviada (pra Giulia saber o que ela perguntou)
);
CREATE INDEX IF NOT EXISTS idx_giulia_tarefas_pend
  ON giulia_tarefas(proxima_cobranca_em) WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS idx_giulia_tarefas_prazo
  ON giulia_tarefas(prazo) WHERE status = 'pendente';
