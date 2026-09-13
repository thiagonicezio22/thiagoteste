-- v31: modulo de expedicoes do Jota (eventos + inscricoes por familia)
CREATE TABLE IF NOT EXISTS giulia_expedicoes (
  id          SERIAL PRIMARY KEY,
  dono_numero TEXT NOT NULL,
  nome        TEXT NOT NULL,
  destino     TEXT,
  data_ini    DATE,
  data_fim    DATE,
  vagas       INT,
  valor       NUMERIC,
  status      TEXT NOT NULL DEFAULT 'aberta',  -- aberta | fechada | concluida | cancelada
  criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS giulia_expedicao_inscritos (
  id           SERIAL PRIMARY KEY,
  expedicao_id INT NOT NULL REFERENCES giulia_expedicoes(id) ON DELETE CASCADE,
  pessoa_nome  TEXT NOT NULL,
  tipo         TEXT,
  telefone     TEXT,
  pago         BOOLEAN NOT NULL DEFAULT false,
  obs          TEXT,
  criado_em    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exp_inscrito_unico ON giulia_expedicao_inscritos (expedicao_id, lower(pessoa_nome));
