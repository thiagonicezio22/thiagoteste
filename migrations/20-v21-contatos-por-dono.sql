-- v21: contatos por dono (privacidade entre usuarios)
-- A tabela era global (design da epoca de usuario unico): qualquer dono
-- enxergava e podia mandar mensagem para os contatos do Thiago. Agora cada
-- dono tem a propria agenda de contatos. Backfill: tudo que existia foi
-- salvo em conversas do Thiago -> vira dele.

ALTER TABLE giulia_contatos ADD COLUMN IF NOT EXISTS dono_numero TEXT;
UPDATE giulia_contatos SET dono_numero = '5511910441709' WHERE dono_numero IS NULL;
ALTER TABLE giulia_contatos ALTER COLUMN dono_numero SET NOT NULL;

-- unicidade passa a ser por dono (o mesmo numero pode ser contato de varios donos)
ALTER TABLE giulia_contatos DROP CONSTRAINT IF EXISTS giulia_contatos_numero_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_contatos_dono_contato
  ON giulia_contatos (dono_numero, numero);

-- limpeza de contatos fantasmas criados por baterias de teste antigas
DELETE FROM giulia_contatos WHERE numero IN ('559988877666', '5511999991234');
