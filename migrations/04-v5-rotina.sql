-- Giulia v5 - rotina semanal (tarefas recorrentes por dia da semana)

CREATE TABLE IF NOT EXISTS giulia_rotina (
  id SERIAL PRIMARY KEY,
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    -- 0=domingo, 1=segunda, 2=terca, 3=quarta, 4=quinta, 5=sexta, 6=sabado (PostgreSQL DOW)
  tarefa TEXT NOT NULL,
  hora_aviso TIME DEFAULT '07:00',
  hora_reforco TIME DEFAULT '12:00',
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_giulia_rotina_dia ON giulia_rotina(dia_semana) WHERE ativa = TRUE;

-- evita duplicacao de tarefa identica no mesmo dia
ALTER TABLE giulia_rotina DROP CONSTRAINT IF EXISTS uq_giulia_rotina_dia_tarefa;
ALTER TABLE giulia_rotina ADD CONSTRAINT uq_giulia_rotina_dia_tarefa UNIQUE (dia_semana, tarefa);
