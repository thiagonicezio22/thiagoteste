-- Giulia v8 - lembretes de reuniao pro cliente (24h/2h antes)

ALTER TABLE giulia_reunioes ADD COLUMN IF NOT EXISTS lembrete_24h_enviado BOOLEAN DEFAULT FALSE;
ALTER TABLE giulia_reunioes ADD COLUMN IF NOT EXISTS lembrete_2h_enviado BOOLEAN DEFAULT FALSE;
