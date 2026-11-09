-- Giulia v9 - contas a pagar com lembretes de vencimento + comprovantes por imagem

CREATE TABLE IF NOT EXISTS giulia_contas_pagar (
  id SERIAL PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor DECIMAL(12,2),
  vencimento DATE NOT NULL,
  recorrencia TEXT,                  -- NULL | mensal | semanal | anual
  status TEXT DEFAULT 'pendente',    -- pendente | paga | cancelada
  pago_em TIMESTAMP,
  gasto_id INTEGER,                  -- link pro gasto criado quando paga
  comprovante_url TEXT,              -- fileURL do comprovante (print/recibo)
  lembrete_3d_enviado BOOLEAN DEFAULT FALSE,
  lembrete_1d_enviado BOOLEAN DEFAULT FALSE,
  lembrete_dia_enviado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_giulia_contas_pend
  ON giulia_contas_pagar(vencimento) WHERE status = 'pendente';

-- comprovante nos gastos (fileURL da imagem quando registrado por foto)
ALTER TABLE giulia_gastos ADD COLUMN IF NOT EXISTS comprovante_url TEXT;
