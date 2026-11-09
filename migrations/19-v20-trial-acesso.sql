-- v20: acesso por periodo de teste (trial) por dono
-- Pedido do Thiago (12/07): liberar o sistema pro Joao (Ambiente Aquatico)
-- por 30 dias, monitorar e avisar quando acabar.
--
-- Modelo: trial_dias define o tamanho do teste; o relogio SO comeca a
-- contar quando o usuario manda a primeira mensagem (acesso_expira_em e
-- preenchido pelo WF14 nesse momento). 5 dias antes de vencer o Thiago
-- recebe aviso (trial_aviso_d5); ao vencer o dono vira status 'suspenso'
-- (cai fora do modo dono no WF01) e o Thiago recebe o resumo de uso.
-- Reativacao por chat: acao gerenciar_acesso (so Thiago).

ALTER TABLE giulia_donos
  ADD COLUMN IF NOT EXISTS trial_dias INT,
  ADD COLUMN IF NOT EXISTS acesso_expira_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_aviso_d5 BOOLEAN NOT NULL DEFAULT FALSE;
