-- v25: modo eco - usuario sem responder ha 5+ dias recebe so o briefing
-- da manha; fechamento 21h, cobrancas de tarefa, follow-ups de orcamento
-- e avisos de recebiveis pausam sozinhos (lembretes explicitos continuam).
-- Volta ao normal automaticamente na primeira mensagem do usuario.
-- eco_avisado_em = estado do AVISO ao Thiago (nao do modo em si, que e
-- calculado ao vivo pela memoria).

ALTER TABLE giulia_donos ADD COLUMN IF NOT EXISTS eco_avisado_em TIMESTAMPTZ;
