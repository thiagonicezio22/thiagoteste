-- v26: IA financeira das planilhas do Thiago (exclusivo 5511910441709)
--
-- giulia_planilhas_fin: arquivo xlsx vivo (formato zip STORE, sem compressao,
--   porque o n8n bloqueia zlib nos Code nodes) em base64, um registro por
--   planilha. A versao atual fica aqui; toda edicao grava a versao anterior
--   em giulia_planilhas_fin_versoes ANTES de sobrescrever (regra 7 do manual:
--   backup antes de editar).
-- giulia_fin_pendentes: plano de escrita aguardando "confirma" do Thiago
--   (regra do manual: sempre confirmar antes de escrever).

CREATE TABLE IF NOT EXISTS giulia_planilhas_fin (
  id            SERIAL PRIMARY KEY,
  dono_numero   TEXT NOT NULL,
  chave         TEXT NOT NULL,              -- lojao | horizon | obras | epdm-antigo
  nome_arquivo  TEXT NOT NULL,              -- docName no envio via WhatsApp
  descricao     TEXT,
  editavel      BOOLEAN NOT NULL DEFAULT true,  -- epdm-antigo = false (espelho, nao alimentar)
  versao        INT NOT NULL DEFAULT 1,
  arquivo_b64   TEXT NOT NULL,
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_em     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (dono_numero, chave)
);

CREATE TABLE IF NOT EXISTS giulia_planilhas_fin_versoes (
  id             SERIAL PRIMARY KEY,
  planilha_id    INT NOT NULL REFERENCES giulia_planilhas_fin(id) ON DELETE CASCADE,
  versao         INT NOT NULL,
  arquivo_b64    TEXT NOT NULL,
  resumo_mudanca TEXT,
  criado_em      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS giulia_fin_pendentes (
  id           SERIAL PRIMARY KEY,
  dono_numero  TEXT NOT NULL,
  plano        JSONB NOT NULL,   -- {chave, escritas:[{aba, ref, valor, tipo}], resumo, avisos}
  status       TEXT NOT NULL DEFAULT 'pendente',  -- pendente | aplicado | cancelado
  criado_em    TIMESTAMP NOT NULL DEFAULT NOW(),
  resolvido_em TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fin_pendentes_dono
  ON giulia_fin_pendentes (dono_numero, status);
