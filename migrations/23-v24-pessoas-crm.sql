-- v24: base de pessoas (CRM de datas) - pedido do piloto Johannes
-- Planilha de clientes/participantes vira base consultavel: aniversariantes
-- do dia aparecem no briefing da manha e sob demanda ('quem faz aniversario
-- essa semana'). Tabela separada de giulia_contatos de proposito: a agenda
-- de contatos (envio de mensagens) fica pequena; a base CRM pode ter
-- milhares de linhas sem inflar o prompt.

CREATE TABLE IF NOT EXISTS giulia_pessoas (
  id          SERIAL PRIMARY KEY,
  dono_numero TEXT NOT NULL,
  nome        TEXT NOT NULL,
  nascimento  DATE,
  grupo       TEXT,
  numero      TEXT,
  observacoes TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- dedupe de reimportacao (mesmo nome + mesma data para o mesmo dono)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pessoas_dono_nome_nasc
  ON giulia_pessoas (dono_numero, lower(nome), COALESCE(nascimento, '1900-01-01'::date));

CREATE INDEX IF NOT EXISTS idx_pessoas_aniversario
  ON giulia_pessoas (dono_numero, nascimento) WHERE nascimento IS NOT NULL;
