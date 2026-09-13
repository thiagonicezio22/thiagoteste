-- v22: modo de cobranca de tarefas por dono
-- 'padrao' = janelas do cron (varias ao dia, conforme urgencia)
-- 'diaria' = uma cobranca por dia, na janela da manha local (7h-10h)
-- Pedido do Thiago (15/07): o Andre estava recebendo mensagem demais e
-- parou de usar - abordagem nova comeca reduzindo o ruido pra ele.

ALTER TABLE giulia_donos
  ADD COLUMN IF NOT EXISTS cobranca_modo TEXT NOT NULL DEFAULT 'padrao';

UPDATE giulia_donos SET cobranca_modo = 'diaria' WHERE numero = '17869660718';
