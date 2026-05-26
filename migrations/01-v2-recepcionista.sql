-- Giulia v2 - modo recepcionista publica
-- Idempotente: pode rodar varias vezes sem efeito colateral

-- 1. Memoria por contato (thread separada por numero)
ALTER TABLE giulia_memoria ADD COLUMN IF NOT EXISTS from_numero TEXT;
CREATE INDEX IF NOT EXISTS idx_giulia_memoria_from
  ON giulia_memoria(from_numero, created_at DESC);

-- 2. Leads qualificados (clientes que entraram em contato)
CREATE TABLE IF NOT EXISTS giulia_leads (
  id SERIAL PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  nome TEXT,
  tipo_projeto TEXT,           -- lago_ornamental, piscina_praia, consultoria, render, supervisao
  porte TEXT,                  -- residencial, comercial, industrial, alto_padrao
  localizacao TEXT,            -- cidade/estado/pais
  fase TEXT,                   -- ideia, em_andamento, pos_venda, imprensa, outro
  origem TEXT,                 -- como chegou (instagram, indicacao, etc)
  resumo TEXT,                 -- o que a Giulia entendeu da demanda
  status TEXT DEFAULT 'novo',  -- novo, em_atendimento, agendado, perdido, convertido
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_giulia_leads_numero ON giulia_leads(numero);
CREATE INDEX IF NOT EXISTS idx_giulia_leads_status ON giulia_leads(status);

-- 3. Reunioes agendadas com o Thiago
CREATE TABLE IF NOT EXISTS giulia_reunioes (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES giulia_leads(id) ON DELETE SET NULL,
  numero_cliente TEXT NOT NULL,
  nome_cliente TEXT,
  agendado_para TIMESTAMP NOT NULL,
  duracao_min INTEGER DEFAULT 30,
  assunto TEXT,
  link_reuniao TEXT,
  status TEXT DEFAULT 'pendente_aprovacao_thiago',
    -- pendente_aprovacao_thiago, agendada, confirmada, realizada, cancelada
  criada_em TIMESTAMP DEFAULT NOW(),
  confirmada_em TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_giulia_reunioes_status ON giulia_reunioes(status);
CREATE INDEX IF NOT EXISTS idx_giulia_reunioes_data ON giulia_reunioes(agendado_para);

-- 4. Notificacoes pendentes pro Thiago (lead novo, agendamento, recado)
CREATE TABLE IF NOT EXISTS giulia_notificacoes_thiago (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,          -- lead_novo, agendamento_pendente, recado, encaminhamento
  origem_numero TEXT,
  origem_nome TEXT,
  resumo TEXT NOT NULL,
  urgencia TEXT DEFAULT 'normal',  -- urgente, normal, info
  status TEXT DEFAULT 'pendente',  -- pendente, processando, enviada
  enviada_em TIMESTAMP,
  criada_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_giulia_notif_pendentes
  ON giulia_notificacoes_thiago(criada_em) WHERE status='pendente';
ALTER TABLE giulia_reunioes ALTER COLUMN agendado_para DROP NOT NULL;
