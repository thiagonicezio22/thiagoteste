-- Giulia - flag de contatos engano (numero errado, marketing, spam recorrente)
-- Quando Giulia detectar que cliente busca outra empresa/pessoa, marca aqui
-- e proximas msgs do mesmo numero sao ignoradas por 30 dias

CREATE TABLE IF NOT EXISTS giulia_contatos_engano (
  numero TEXT PRIMARY KEY,
  motivo TEXT,                      -- "busca empresa X", "marketing Bem Barato", etc
  detectado_em TIMESTAMP DEFAULT NOW(),
  expira_em TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  giulia_avisou BOOLEAN DEFAULT TRUE  -- se ja avisou pelo menos 1x
);
CREATE INDEX IF NOT EXISTS idx_giulia_engano_expira
  ON giulia_contatos_engano(expira_em);
