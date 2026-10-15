-- v17: feature de orcamentos em PDF (docs/FEATURE-ORCAMENTOS.md)
-- Cada dono pode ter modelos de orcamento (PPTX com placeholders {{campo}});
-- cada orcamento gerado recebe numero sequencial por dono/ano (ORC-2026-001)
-- e status para o follow-up com o proprio dono.

CREATE TABLE IF NOT EXISTS giulia_orcamento_templates (
  id          SERIAL PRIMARY KEY,
  dono_numero TEXT NOT NULL,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  -- lista dos placeholders do modelo, com dica de preenchimento para a IA
  -- ex: [{"campo":"cliente","dica":"nome do cliente final"}, ...]
  campos      JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- PPTX original em base64 (fica no banco: um arquivo por cliente, poucos MB)
  arquivo_b64 TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orc_templates_dono
  ON giulia_orcamento_templates (dono_numero) WHERE ativo;

CREATE TABLE IF NOT EXISTS giulia_orcamentos (
  id            SERIAL PRIMARY KEY,
  dono_numero   TEXT NOT NULL,
  template_id   INT REFERENCES giulia_orcamento_templates(id),
  numero        TEXT NOT NULL,                 -- ORC-2026-001 (por dono/ano)
  cliente_final TEXT NOT NULL,
  valor         NUMERIC(14,2),
  moeda         TEXT NOT NULL DEFAULT 'BRL',
  campos        JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- gerado | enviado | aprovado | recusado | expirado
  status        TEXT NOT NULL DEFAULT 'gerado',
  validade_dias INT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultimo_followup TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orcamentos_dono_numero
  ON giulia_orcamentos (dono_numero, numero);

CREATE INDEX IF NOT EXISTS idx_orcamentos_followup
  ON giulia_orcamentos (dono_numero, status)
  WHERE status IN ('gerado', 'enviado');
