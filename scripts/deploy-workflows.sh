#!/usr/bin/env bash
# Deploy dos workflows JSON do repo pra dentro do n8n.
# Le os arquivos em workflows/, substitui placeholders pelos env vars,
# faz PUT no workflow existente (id hardcoded por arquivo).
#
# Le do ambiente:
#   N8N_API_KEY               token admin do n8n
#   N8N_URL                   ex: https://whats-n8n.ghikuu.easypanel.host
#   GIULIA_UAZAPI_TOKEN       token da instancia UAZAPI da Giulia
#   GIULIA_GEMINI_API_KEY     chave Gemini dedicada da Giulia
#   GIULIA_SHEETS_DOC_ID      (opcional) id da planilha de gastos no Google Drive
#   GIULIA_SHEETS_TAB         (opcional) nome da aba (default 'Gastos')
#   GIULIA_SHEETS_CRED_ID     (opcional) id da credencial Google Sheets no n8n
#   GIULIA_SHEETS_CRED_NAME   (opcional) nome da credencial (visual)

set -euo pipefail

: "${N8N_API_KEY:?defina N8N_API_KEY}"
: "${N8N_URL:?defina N8N_URL}"
: "${GIULIA_UAZAPI_TOKEN:?defina GIULIA_UAZAPI_TOKEN}"
: "${GIULIA_GEMINI_API_KEY:?defina GIULIA_GEMINI_API_KEY}"
GIULIA_SHEETS_DOC_ID="${GIULIA_SHEETS_DOC_ID:-}"
GIULIA_SHEETS_TAB="${GIULIA_SHEETS_TAB:-Gastos}"
GIULIA_SHEETS_CRED_ID="${GIULIA_SHEETS_CRED_ID:-}"
GIULIA_SHEETS_CRED_NAME="${GIULIA_SHEETS_CRED_NAME:-Google Sheets Giulia}"

deploy() {
  local wf_id="$1"
  local local_file="$2"
  local wf_label="$3"
  echo "Deploy $wf_label ($wf_id) <- $local_file"

  # Checa se workflow esta ativo agora
  local was_active
  was_active=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_URL/api/v1/workflows/$wf_id" \
    | python3 -c "import json,sys; print(json.load(sys.stdin).get('active', False))")

  if [ "$was_active" = "True" ]; then
    echo "  desativando temporariamente..."
    curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_URL/api/v1/workflows/$wf_id/deactivate" > /dev/null
  fi

  # Le JSON, substitui placeholders, monta payload minimo
  UAZAPI_TOKEN="$GIULIA_UAZAPI_TOKEN" \
  GEMINI_KEY="$GIULIA_GEMINI_API_KEY" \
  SHEETS_DOC="$GIULIA_SHEETS_DOC_ID" \
  SHEETS_TAB="$GIULIA_SHEETS_TAB" \
  SHEETS_CRED_ID="$GIULIA_SHEETS_CRED_ID" \
  SHEETS_CRED_NAME="$GIULIA_SHEETS_CRED_NAME" \
  python3 << PYEOF > /tmp/wf_put.json
import json, os
with open('$local_file') as f:
    d = json.load(f)
raw = json.dumps(d)
raw = raw.replace('__GIULIA_UAZAPI_TOKEN__', os.environ['UAZAPI_TOKEN'])
raw = raw.replace('__GIULIA_GEMINI_API_KEY__', os.environ['GEMINI_KEY'])
if os.environ['SHEETS_DOC']:
    raw = raw.replace('__GIULIA_SHEETS_DOC_ID__', os.environ['SHEETS_DOC'])
if os.environ['SHEETS_TAB']:
    raw = raw.replace('__GIULIA_SHEETS_TAB__', os.environ['SHEETS_TAB'])
if os.environ['SHEETS_CRED_ID']:
    raw = raw.replace('__GIULIA_SHEETS_CRED_ID__', os.environ['SHEETS_CRED_ID'])
new = json.loads(raw)
# atualizar nome visual da credencial se foi informado
if os.environ['SHEETS_CRED_ID']:
    for n in new['nodes']:
        creds = n.get('credentials', {})
        if 'googleSheetsOAuth2Api' in creds:
            creds['googleSheetsOAuth2Api']['name'] = os.environ['SHEETS_CRED_NAME']
payload = {
    'name': new['name'],
    'nodes': new['nodes'],
    'connections': new['connections'],
    'settings': new['settings']
}
print(json.dumps(payload))
PYEOF

  local resp
  resp=$(curl -s -X PUT \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d @/tmp/wf_put.json \
    "$N8N_URL/api/v1/workflows/$wf_id")

  if echo "$resp" | grep -q '"id"'; then
    echo "  PUT OK"
  else
    echo "  PUT FALHOU:"
    echo "$resp" | head -c 800
    echo
    rm -f /tmp/wf_put.json
    exit 1
  fi
  rm -f /tmp/wf_put.json

  if [ "$was_active" = "True" ]; then
    echo "  reativando..."
    local ok=""
    for tent in 1 2 3; do
      curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_URL/api/v1/workflows/$wf_id/activate" > /dev/null
      ok=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_URL/api/v1/workflows/$wf_id" \
        | python3 -c "import json,sys; print(json.load(sys.stdin).get('active', False))")
      if [ "$ok" = "True" ]; then
        echo "  active: True (verificado)"
        break
      fi
      echo "  ATENCAO: ainda inativo (tentativa $tent), retentando..."
      sleep 2
    done
    if [ "$ok" != "True" ]; then
      echo "  ERRO FATAL: $wf_label NAO REATIVOU - workflow parado em producao!"
      exit 1
    fi
  fi
}

deploy "Tm1Ec80tegOqWS4N" "workflows/01-GIULIA-Pipeline.json" "GIULIA - 01 Pipeline"
deploy "sl6gOYuAIwvCRvOP" "workflows/02-GIULIA-Scheduler.json" "GIULIA - 02 Scheduler"
deploy "DbNuINWG5JBEE08F" "workflows/04-GIULIA-Sumarizar-Memoria.json" "GIULIA - 04 Sumarizar Memoria"
deploy "5kfBHcPbR0UMQxMK" "workflows/05-GIULIA-Rotina-Diaria.json" "GIULIA - 05 Rotina Diaria"
deploy "5WhC5PwNoptX5lKm" "workflows/06-GIULIA-Cobrar-Tarefas.json" "GIULIA - 06 Cobrar Tarefas"
deploy "ZFr4vsDTHv8TDrXE" "workflows/07-GIULIA-Briefing-Matinal.json" "GIULIA - 07 Briefing Matinal"
deploy "J1Sj1a3aTvcPQ391" "workflows/08-GIULIA-Lembretes-Reuniao-Cliente.json" "GIULIA - 08 Lembretes Reuniao Cliente"
deploy "nqLalQVouNGgh4EQ" "workflows/09-GIULIA-Lembretes-Contas.json" "GIULIA - 09 Lembretes Contas"
deploy "AEVYq2LMB608RnU8" "workflows/03-GIULIA-Sync-Gastos-Sheets.json" "GIULIA - 03 Sync Gastos Sheets"
deploy "q8HWnaLoiBTVXP0a" "workflows/10-GIULIA-Relatorio-Gastos.json" "GIULIA - 10 Relatorio Gastos"
deploy "yISL7XnwlOBkD0Dz" "workflows/11-GIULIA-Fechamento-Dia.json" "GIULIA - 11 Fechamento do Dia"
deploy "WnNoWQX8IJKy6MgP" "workflows/12-GIULIA-Orcamentos.json" "GIULIA - 12 Orcamentos PDF"
deploy "m74g1NvcBTiu08ce" "workflows/13-GIULIA-Orcamentos-Followup.json" "GIULIA - 13 Orcamentos Followup"

echo ""
echo "Workflows deployados com secrets injetados."
