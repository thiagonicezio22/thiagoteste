# CRM Jota Expedições (aniversariantes 2.0)

> Criado em 07/08/2026 a partir da análise das 70 mensagens do Jota
> (5511964070127). Empresa: jotaexpedicoes.com.br — agência 4x4
> (CADASTUR), expedições com vagas limitadas, inscrição por família
> (piloto + acompanhantes). O CRM de aniversários é o coração do uso.

## O que o uso real dele pediu (e agora existe)

1. **Relatório com telefone + tipo** (pedido de 03/08, nunca entregue):
   aniversariantes agora saem `Nome (idade) — Piloto/Acompanhante` com
   `📱 telefone`; acompanhante sem telefone mostra `📱 piloto Fulano:
   <tel>` via vínculo de família. Vale no briefing (WF07) e na ação
   aniversariantes. Formato é data-driven: aparece quando o dado existe.
2. **Import 2.0** (`importar_planilha`): pares ganham `tel_col`; o 1º par
   é o piloto e os demais acompanhantes (tipo automático pela posição);
   `familia` = nome do piloto da linha; **reenvio da planilha ATUALIZA
   quem já existe** (upsert por dono+lower(nome)+nascimento) em vez de
   duplicar — telefone/tipo/família entram sem recadastrar.
3. **buscar_cliente** (caso Fernanda Romagnoli): busca por similaridade
   (sem acento, tokens de sobrenome) na base do dono.
4. **estatisticas_clientes**: painel honesto da base (total, sem
   nascimento, com telefone, pilotos × acompanhantes, famílias) +
   dica de reenvio quando faltam dados.

Ações visíveis no prompt para Jota e Thiago (dados sempre escopados por
dono). Migração 29: coluna `familia` em giulia_pessoas.

## Estado da base dele (07/08)

1.458 cadastros · 999 com nascimento (459 sem) · 121 com telefone ·
tipo em ~5% · família em 0%. **O destrave é o Jota reenviar a planilha
completa uma vez** — o import 2.0 enriquece tudo sem duplicar.

## Pendências/idéias sugeridas (não construídas)

- Mensagem de parabéns pronta pra encaminhar (padrão recebíveis).
- Módulo expedições: evento + inscrições por família + vagas + pagos.
- Exportar a base em Excel (motor premium já existe).
- Limpeza das ~150 pessoas da janela LLM de 16/07 (criado_em <
  2026-07-17 10:00) após o reenvio confirmar a base.

## Módulo Expedições (07/08, 2ª onda — testado, aguardando liberação)

Tabelas `giulia_expedicoes` + `giulia_expedicao_inscritos` (migração 30).
Ações (prompt Jota + Thiago): `criar_expedicao`, `listar_expedicoes`
(ocupação + contagem regressiva), `inscrever_expedicao` (pessoa OU
"família do fulano" — puxa piloto + acompanhantes vinculados da base,
copia tipo/telefone; exige match único; avisa lotação/últimas vagas),
`lista_inscritos` (✅/⬜ pagos + telefones), `marcar_pago_expedicao`,
`cancelar_inscricao`. Briefing (WF07): seção "Expedições chegando" com
dias faltando/inscritos/pagos (janela 60 dias). Extra: mensagem de
parabéns pronta pra encaminhar (via prompt, assinada com o negócio do
dono) e 🎉 em idade redonda.

Bateria 07/08: 9/9 — criar, inscrever família (+3), total/vagas com
aviso de lotação, dedupe honesto, pago, cancelar, listagem com countdown,
subquery do briefing, parabéns. Corrigidos na bateria: total que não via
as próprias inserções (snapshot) e telefone sem máscara na lista.

## Cartão de aniversário visual (07/08, 3ª onda)

Cartão PNG 1200×1200 na identidade da "Proposta de Parceria 2026 OffRoad
Azul" do Jota (navy + azul, hazard stripes, coordenadas da Canastra,
carimbo "KM +1", logo hexagonal extraído do PDF dele). Gerador:
`services/cartoes-jota/gerar_cartao_aniversario.py` (PIL). A arte fica
em `giulia_config` (chave `CARTAO_ANIV_<dono>`); ação `cartao_parabens`
manda a IMAGEM no chat do dono com legenda personalizada da IA (nome +
assinatura do negócio) — pronto pra encaminhar. Roteador ganhou o tipo
CARTAO (Carregar Cartao → Tem Cartao? → Enviar Cartao UAZAPI). Testado
e2e: imagem + legenda entregues. Mesmo pipeline serve pra próximas artes
(voucher, capa de expedição, save-the-date).

## Artes dinâmicas em PDF + cartão v2 neon (07/08, 4ª onda)

- Cartão de aniversário **v2**: verde neon mesclado (gradiente azul→neon
  no título, faixas alternadas, carimbo neon); legenda SEMPRE assinada
  "Equipe Jota Expedições Off-Road" (prompt + fallback determinístico).
- **capa_expedicao**: PDF de divulgação gerado em runtime pelo motor dos
  orçamentos — fundo JPEG da marca (giulia_config CAPA_EXP_BG/LAYOUT) +
  nome, destino, data com countdown, vagas livres e valor da expedição.
- **voucher_inscricao**: PDF por inscrito com nome, expedição, data e
  status do pagamento (CONFIRMADA-PAGA / RESERVADO).
- Roteador tipo ARTE: Executar Arte SQL → Gerar Arte PDF (pdf-writer
  embutido) → Enviar Arte UAZAPI (documento) / aviso quando não achar.
- Testado e2e: os 2 PDFs gerados, entregues e conferidos visualmente
  (render). WinAnsi: artes sem emoji no PDF (legendas podem ter).

## Liberação (08/08)

Anúncio completo enviado ao Jota pela assistente (aprovado pelo Thiago):
relatório novo, busca, painel, módulo expedições, cartão (com exemplo
visual anexado), capa e voucher — mais o pedido de reenvio da planilha
completa (o import 2.0 enriquece sem duplicar). Registrado na memória
da conversa dele. Próximo marco: quando ele reenviar o arquivo, conferir
a importação e depois limpar as ~150 pessoas suspeitas da janela LLM de
16/07 (criado_em < 2026-07-17 10:00).
