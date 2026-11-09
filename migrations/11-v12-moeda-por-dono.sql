-- v12: moeda por dono (Andre usa dolar americano)
-- O Andre avisou em 03/07/2026 que todos os pagamentos dele sao em USD.
-- Relatorios, briefing e lembretes de contas passam a formatar na moeda do dono.

ALTER TABLE giulia_donos ADD COLUMN IF NOT EXISTS moeda TEXT NOT NULL DEFAULT 'BRL';

UPDATE giulia_donos SET moeda = 'USD' WHERE numero = '17869660718';

-- Correcao de dados: o comprovante de $8.230 (Marchioni Custom Furniture) era o
-- pagamento do servico de construcao do Laercio; o Andre corrigiu na conversa
-- mas a descricao nao tinha sido atualizada.
UPDATE giulia_gastos
SET descricao = 'Laercio (pago via Marchioni Custom Furniture) - servico de construcao',
    observacoes = 'Vidros do escritorio, assentamento de pedras do escritorio e do showroom, deck de madeira interno do showroom'
WHERE id = 9 AND dono_numero = '17869660718';
