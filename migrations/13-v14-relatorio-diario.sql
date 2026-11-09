-- v14: relatorio de fechamento do dia (21h no fuso do dono)
-- Flag por dono (produto: recurso ativavel). Inicialmente ativo so pro Thiago;
-- o Andre entra quando o Thiago liberar. ultimo_relatorio_diario deduplica o
-- disparo do cron horario.

ALTER TABLE giulia_donos ADD COLUMN IF NOT EXISTS relatorio_diario BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE giulia_donos ADD COLUMN IF NOT EXISTS ultimo_relatorio_diario DATE;

UPDATE giulia_donos SET relatorio_diario = TRUE WHERE numero = '5511910441709';
