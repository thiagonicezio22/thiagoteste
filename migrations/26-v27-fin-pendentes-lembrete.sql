-- v27: lembrete de lancamentos financeiros parados (WF14)
ALTER TABLE giulia_fin_pendentes ADD COLUMN IF NOT EXISTS lembrado_em TIMESTAMP;
