-- v15: donos dinamicos (onboarding por indicacao)
-- O Thiago cadastra novos usuarios por conversa ("conhece o Rafael, numero X").
-- A resolucao de dono no pipeline passa a ser feita pelo banco (giulia_donos),
-- nao mais por mapa fixo no codigo - um registro por numero cadastrado.

ALTER TABLE giulia_donos ADD COLUMN IF NOT EXISTS criado_por TEXT;
ALTER TABLE giulia_donos ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo';
