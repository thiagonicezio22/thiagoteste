-- v19: confirmacao em duas etapas para orcamentos (padrao envios_pendentes)
-- A IA grava o orcamento como pendente junto com o RESUMO obrigatorio;
-- o 'confirma' do dono dispara o WF12 que gera o PDF e move o registro
-- definitivo para giulia_orcamentos (com numero sequencial ORC-YYYY-NNN).

CREATE TABLE IF NOT EXISTS giulia_orcamentos_pendentes (
  id            SERIAL PRIMARY KEY,
  dono_numero   TEXT NOT NULL,
  cliente_final TEXT NOT NULL,
  campos        JSONB NOT NULL,
  valor         NUMERIC(14,2),
  validade_dias INT NOT NULL DEFAULT 15,
  -- aguardando_confirmacao | processando | processado | cancelado | erro
  status        TEXT NOT NULL DEFAULT 'aguardando_confirmacao',
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em     TIMESTAMPTZ NOT NULL DEFAULT now() + interval '2 hours'
);

CREATE INDEX IF NOT EXISTS idx_orc_pendentes_dono
  ON giulia_orcamentos_pendentes (dono_numero, status);
