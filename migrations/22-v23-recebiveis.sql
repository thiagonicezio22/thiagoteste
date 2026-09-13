-- v23: contas a receber com "Pix pronto" (Tier 1 da pesquisa de jul/2026)
-- Padrao validado pelo mercado (Jota): no vencimento o assistente manda ao
-- dono a mensagem de cobranca PRONTA pra encaminhar ao cliente, com a chave
-- Pix do dono. Nao executa pagamento - prepara a cobranca.

CREATE TABLE IF NOT EXISTS giulia_recebiveis (
  id             SERIAL PRIMARY KEY,
  dono_numero    TEXT NOT NULL,
  orcamento_id   INT REFERENCES giulia_orcamentos(id),
  cliente_nome   TEXT NOT NULL,
  cliente_numero TEXT,
  descricao      TEXT,
  valor          NUMERIC(14,2) NOT NULL,
  moeda          TEXT NOT NULL DEFAULT 'BRL',
  vencimento     DATE NOT NULL,
  -- pendente | recebido | cancelado
  status         TEXT NOT NULL DEFAULT 'pendente',
  ultimo_aviso   TIMESTAMPTZ,
  recebido_em    TIMESTAMPTZ,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recebiveis_dono_status
  ON giulia_recebiveis (dono_numero, status, vencimento);

-- chave Pix do dono (usada na mensagem de cobranca pronta)
ALTER TABLE giulia_donos ADD COLUMN IF NOT EXISTS pix_chave TEXT;
