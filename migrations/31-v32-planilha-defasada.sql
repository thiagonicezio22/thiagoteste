-- v32: marca planilha financeira editada por fora (copia do sistema desatualizada)
ALTER TABLE giulia_planilhas_fin ADD COLUMN IF NOT EXISTS defasada BOOLEAN NOT NULL DEFAULT false;
