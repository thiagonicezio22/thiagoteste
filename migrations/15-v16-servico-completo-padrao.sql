-- v16: servico completo por padrao para todos os usuarios
-- Pedido do Thiago: todo usuario cadastrado recebe o pacote inteiro,
-- igual ao dele. O fechamento do dia (21h local) passa a vir ligado
-- por padrao - quem nao quiser desativa por conversa
-- ('desativa meu fechamento do dia').

ALTER TABLE giulia_donos ALTER COLUMN relatorio_diario SET DEFAULT TRUE;

UPDATE giulia_donos SET relatorio_diario = TRUE WHERE numero = '17869660718';
