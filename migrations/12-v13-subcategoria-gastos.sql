-- v13: subcategoria nos gastos + categorias dinamicas
-- O dono pode criar categorias proprias por conversa ("coloca na categoria
-- obra showroom") e detalhar com subcategoria. A lista padrao vira sugestao,
-- nao camisa de forca.

ALTER TABLE giulia_gastos ADD COLUMN IF NOT EXISTS subcategoria TEXT;
