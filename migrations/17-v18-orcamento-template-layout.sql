-- v18: caminho n8n-nativo para geracao de orcamentos
-- O template guarda, alem do PPTX original (arquivo_b64, opcional ate o
-- micro-servico estar deployado), o layout de campos (JSON) e as imagens
-- de pagina (JPEG base64) — com isso o proprio n8n gera o PDF, sem
-- depender do container externo.

ALTER TABLE giulia_orcamento_templates
  ADD COLUMN IF NOT EXISTS layout JSONB,
  ADD COLUMN IF NOT EXISTS imagens JSONB;

ALTER TABLE giulia_orcamento_templates
  ALTER COLUMN arquivo_b64 DROP NOT NULL;
