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
