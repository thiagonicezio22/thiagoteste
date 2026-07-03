-- Giulia v10 - deduplicacao de mensagens (retry de webhook nao duplica acoes)

CREATE TABLE IF NOT EXISTS giulia_msgs_processadas (
  message_id TEXT PRIMARY KEY,
  processado_em TIMESTAMP DEFAULT NOW()
);
