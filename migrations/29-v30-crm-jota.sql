-- v30: CRM Jota Expedicoes - vinculo familiar (acompanhante -> piloto da linha)
ALTER TABLE giulia_pessoas ADD COLUMN IF NOT EXISTS familia TEXT;
