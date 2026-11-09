-- Giulia v11 - suporte multi-dono (Thiago + Andre Amorim)
-- Dados pessoais separados por dono; fuso horario por dono

CREATE TABLE IF NOT EXISTS giulia_donos (
  numero TEXT PRIMARY KEY,            -- numero canonico do dono
  nome TEXT NOT NULL,                 -- primeiro nome (tratamento)
  nome_completo TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  idioma TEXT DEFAULT 'pt-BR',
  criado_em TIMESTAMP DEFAULT NOW()
);

INSERT INTO giulia_donos (numero, nome, nome_completo, timezone) VALUES
  ('5511910441709', 'Thiago', 'Thiago Nicezio', 'America/Sao_Paulo'),
  ('17869660718', 'Andre', 'Andre Amorim', 'America/New_York')
ON CONFLICT (numero) DO UPDATE SET nome = EXCLUDED.nome, nome_completo = EXCLUDED.nome_completo, timezone = EXCLUDED.timezone;

-- Coluna de dono nas tabelas pessoais (default = Thiago pra dados existentes)
ALTER TABLE giulia_lembretes ADD COLUMN IF NOT EXISTS dono_numero TEXT DEFAULT '5511910441709';
ALTER TABLE giulia_tarefas ADD COLUMN IF NOT EXISTS dono_numero TEXT DEFAULT '5511910441709';
ALTER TABLE giulia_gastos ADD COLUMN IF NOT EXISTS dono_numero TEXT DEFAULT '5511910441709';
ALTER TABLE giulia_contas_pagar ADD COLUMN IF NOT EXISTS dono_numero TEXT DEFAULT '5511910441709';
ALTER TABLE giulia_ideias ADD COLUMN IF NOT EXISTS dono_numero TEXT DEFAULT '5511910441709';
ALTER TABLE giulia_rotina ADD COLUMN IF NOT EXISTS dono_numero TEXT DEFAULT '5511910441709';
ALTER TABLE giulia_envios_pendentes ADD COLUMN IF NOT EXISTS dono_numero TEXT DEFAULT '5511910441709';

UPDATE giulia_lembretes SET dono_numero = '5511910441709' WHERE dono_numero IS NULL;
UPDATE giulia_tarefas SET dono_numero = '5511910441709' WHERE dono_numero IS NULL;
UPDATE giulia_gastos SET dono_numero = '5511910441709' WHERE dono_numero IS NULL;
UPDATE giulia_contas_pagar SET dono_numero = '5511910441709' WHERE dono_numero IS NULL;
UPDATE giulia_ideias SET dono_numero = '5511910441709' WHERE dono_numero IS NULL;
UPDATE giulia_rotina SET dono_numero = '5511910441709' WHERE dono_numero IS NULL;
UPDATE giulia_envios_pendentes SET dono_numero = '5511910441709' WHERE dono_numero IS NULL;

-- Contato do Andre
INSERT INTO giulia_contatos (nome, apelidos, numero, observacoes) VALUES
  ('Andre Amorim', ARRAY['andre','amorim'], '17869660718', 'Dono da Giulia - mora na Florida (EUA), fuso America/New_York')
ON CONFLICT (numero) DO UPDATE SET nome = EXCLUDED.nome, observacoes = EXCLUDED.observacoes;

-- Facts iniciais do Andre
INSERT INTO giulia_facts (about_numero, fact, categoria, fonte) VALUES
  ('17869660718', 'Mora na Florida (EUA), fuso horario America/New_York - todos os horarios dele sao no horario da Florida', 'contexto', 'bootstrap'),
  ('17869660718', 'Fala portugues - toda comunicacao em PT-BR', 'preferencia', 'bootstrap'),
  ('17869660718', 'Toma remedios todos os dias as 09:30 da manha e as 22:00 antes de dormir (horario da Florida)', 'pessoal', 'bootstrap'),
  ('17869660718', 'Precisa de bastante ajuda com organizacao pessoal', 'contexto', 'bootstrap')
ON CONFLICT (about_numero, fact) DO NOTHING;

-- Lembretes diarios de remedio (horario LOCAL da Florida, naive)
-- Proxima ocorrencia: se ainda nao passou hoje (hora local), hoje; senao amanha
INSERT INTO giulia_lembretes (descricao, disparar_em, recorrencia, dono_numero)
SELECT 'Tomar os remedios da manha',
  CASE WHEN (NOW() AT TIME ZONE 'America/New_York')::time < TIME '09:30'
    THEN (NOW() AT TIME ZONE 'America/New_York')::date + TIME '09:30'
    ELSE (NOW() AT TIME ZONE 'America/New_York')::date + 1 + TIME '09:30'
  END,
  'diaria', '17869660718'
WHERE NOT EXISTS (SELECT 1 FROM giulia_lembretes WHERE dono_numero = '17869660718' AND descricao ILIKE '%remedios da manha%' AND status = 'pendente');

INSERT INTO giulia_lembretes (descricao, disparar_em, recorrencia, dono_numero)
SELECT 'Tomar os remedios antes de dormir',
  CASE WHEN (NOW() AT TIME ZONE 'America/New_York')::time < TIME '22:00'
    THEN (NOW() AT TIME ZONE 'America/New_York')::date + TIME '22:00'
    ELSE (NOW() AT TIME ZONE 'America/New_York')::date + 1 + TIME '22:00'
  END,
  'diaria', '17869660718'
WHERE NOT EXISTS (SELECT 1 FROM giulia_lembretes WHERE dono_numero = '17869660718' AND descricao ILIKE '%antes de dormir%' AND status = 'pendente');
ALTER TABLE giulia_rotina DROP CONSTRAINT IF EXISTS uq_giulia_rotina_dia_tarefa;
ALTER TABLE giulia_rotina ADD CONSTRAINT uq_giulia_rotina_dono_dia_tarefa UNIQUE (dono_numero, dia_semana, tarefa);
