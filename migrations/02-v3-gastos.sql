-- Giulia v3 - controle financeiro pessoal
-- Idempotente

CREATE TABLE IF NOT EXISTS giulia_gastos (
  id SERIAL PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT,
    -- alimentacao, transporte, casa, saude, lazer, vestuario,
    -- educacao, assinatura, impostos, presente, pet, profissional, outros
  forma_pagamento TEXT,
    -- cartao_credito, cartao_debito, pix, dinheiro, boleto, transferencia
  tags TEXT[],
  data_gasto DATE,
  observacoes TEXT,
  sheets_synced BOOLEAN DEFAULT FALSE,
  sheets_synced_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_giulia_gastos_pending_sheets
  ON giulia_gastos(criado_em) WHERE sheets_synced = FALSE;
CREATE INDEX IF NOT EXISTS idx_giulia_gastos_data
  ON giulia_gastos(data_gasto DESC);
CREATE INDEX IF NOT EXISTS idx_giulia_gastos_categoria
  ON giulia_gastos(categoria);
