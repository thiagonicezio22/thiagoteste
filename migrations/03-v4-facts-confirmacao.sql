-- Giulia v4 - memoria estruturada + envios pendentes
-- Idempotente

-- Facts persistentes sobre o Thiago e contatos
-- Ex: "tem 2 filhos", "prefere reuniao 9h", "casado com X", "trabalha sabado"
CREATE TABLE IF NOT EXISTS giulia_facts (
  id SERIAL PRIMARY KEY,
  about_numero TEXT NOT NULL,           -- numero da pessoa sobre quem eh o fato
  fact TEXT NOT NULL,                   -- o fato em si, em frase curta
  categoria TEXT,                       -- pessoal, profissional, preferencia, agenda, contexto
  confidence DECIMAL(3,2) DEFAULT 1.0,  -- 1.0 explicito, 0.5 inferido
  fonte TEXT,                           -- "conversa em 2026-05-17", "vCard"
  ativo BOOLEAN DEFAULT TRUE,           -- pode ser desativado sem deletar
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_giulia_facts_about ON giulia_facts(about_numero) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_giulia_facts_cat ON giulia_facts(about_numero, categoria) WHERE ativo = TRUE;
-- evitar duplicacao exata
ALTER TABLE giulia_facts DROP CONSTRAINT IF EXISTS uq_giulia_facts_about_fact;
ALTER TABLE giulia_facts ADD CONSTRAINT uq_giulia_facts_about_fact UNIQUE (about_numero, fact);

-- Envios pendentes de confirmacao (anti-erro com contato novo)
CREATE TABLE IF NOT EXISTS giulia_envios_pendentes (
  id SERIAL PRIMARY KEY,
  destinatario_numero TEXT NOT NULL,
  destinatario_nome TEXT,
  texto TEXT NOT NULL,
  status TEXT DEFAULT 'aguardando_confirmacao',  -- aguardando_confirmacao, enviado, cancelado, expirado
  expira_em TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour'),
  enviado_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_giulia_envios_pend
  ON giulia_envios_pendentes(criado_em DESC) WHERE status = 'aguardando_confirmacao';

-- Resumos de conversa antiga (sumarizacao)
CREATE TABLE IF NOT EXISTS giulia_memoria_resumos (
  id SERIAL PRIMARY KEY,
  from_numero TEXT NOT NULL,
  resumo TEXT NOT NULL,
  periodo_inicio TIMESTAMP,
  periodo_fim TIMESTAMP,
  msg_count INTEGER,
  criado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_giulia_resumos_from ON giulia_memoria_resumos(from_numero, criado_em DESC);

-- Facts iniciais sobre o Thiago Nicezio (pra Giulia ter contexto desde o inicio)
INSERT INTO giulia_facts (about_numero, fact, categoria, fonte) VALUES
  ('5511910441709', 'Empresario brasileiro especialista em lagos ornamentais e Piscinas Praia', 'profissional', 'bootstrap'),
  ('5511910441709', 'Socio da ENG Solucoes (ozonio e UV para tratamento de agua)', 'profissional', 'bootstrap'),
  ('5511910441709', 'Fundador e Presidente da ABLP (Associacao Brasileira de Lagos Ornamentais e Piscinas Naturais)', 'profissional', 'bootstrap'),
  ('5511910441709', 'Projetos no Brasil, Europa e Estados Unidos', 'profissional', 'bootstrap'),
  ('5511910441709', 'Tem 2 numeros de WhatsApp ativos: 5511910441709 e 5511964486564', 'contexto', 'bootstrap'),
  ('5511910441709', 'CNPJ para contratos: Sua Natureza Ecossistemas', 'profissional', 'bootstrap'),
  ('5511910441709', 'Secretaria: Giulia Mascarenhas (voce mesma)', 'contexto', 'bootstrap'),
  ('5511910441709', 'Contabilidade: Eliana', 'profissional', 'bootstrap'),
  ('5511910441709', 'Site: thiagonicezio.com / Instagram: @thiagonicezio / E-mail: contato@filtrosuvc.com.br', 'contexto', 'bootstrap'),
  ('5511910441709', 'Comunicacao preferida: PT-BR direto, sem rodeio, sem hifens em listas', 'preferencia', 'bootstrap'),
  ('5511910441709', 'NAO menciona anos de experiencia e NAO executa obra civil - apenas projeta, especifica e supervisiona', 'preferencia', 'bootstrap'),
  ('5511910441709', 'Frase de encerramento padrao em interacao formal: \"Agua cristalina nao e promessa. E compromisso tecnico.\"', 'preferencia', 'bootstrap')
ON CONFLICT (about_numero, fact) DO NOTHING;
-- Replica facts pro outro numero do Thiago
INSERT INTO giulia_facts (about_numero, fact, categoria, fonte)
SELECT '5511964486564', fact, categoria, fonte FROM giulia_facts WHERE about_numero = '5511910441709' AND fonte = 'bootstrap'
ON CONFLICT (about_numero, fact) DO NOTHING;
