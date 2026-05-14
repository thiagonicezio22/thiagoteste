#!/usr/bin/env bash
# Substitui __GIULIA_UAZAPI_TOKEN__ pelo token real nos 2 workflows GIULIA no n8n
# Uso: GIULIA_TOKEN="seu-token-aqui" ./scripts/deploy-token.sh

set -euo pipefail

API_KEY="${N8N_API_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MWI5Zjc1OC1iMTJhLTRlNmEtYTI2OC0wMWQ3Y2MzNjhhOGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTI3ZDliNGQtZGY4MC00MGFmLTk0NTMtNGNjYTA3MGEyZTg1IiwiaWF0IjoxNzc0NTM5MTI1fQ.O3vnGOI_9OSZJiti3lEKvumTPNM8jMymRVc9Dvnke9w}"
N8N_URL="${N8N_URL:-https://whats-n8n.ghikuu.easypanel.host}"
TOKEN="${GIULIA_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "ERRO: defina GIULIA_TOKEN com o token da instancia UAZAPI da Giulia"
  echo "Uso: GIULIA_TOKEN=\"abc-123...\" $0"
  exit 1
fi

# Workflows GIULIA conhecidos
PIPELINE_ID="Tm1Ec80tegOqWS4N"
SCHEDULER_ID="sl6gOYuAIwvCRvOP"

update_workflow() {
  local wf_id="$1"
  local wf_name="$2"
  echo "Atualizando $wf_name ($wf_id)..."

  # Baixar
  local current_json
  current_json=$(curl -s -H "X-N8N-API-KEY: $API_KEY" "$N8N_URL/api/v1/workflows/$wf_id")

  # Substituir token e enviar PUT com apenas os campos necessarios
  echo "$current_json" | python3 -c "
import json, sys
d = json.load(sys.stdin)
raw = json.dumps(d)
new_raw = raw.replace('__GIULIA_UAZAPI_TOKEN__', '$TOKEN')
new = json.loads(new_raw)
payload = {
    'name': new['name'],
    'nodes': new['nodes'],
    'connections': new['connections'],
    'settings': new['settings']
}
print(json.dumps(payload))
" > /tmp/wf_update.json

  local resp
  resp=$(curl -s -X PUT \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d @/tmp/wf_update.json \
    "$N8N_URL/api/v1/workflows/$wf_id")

  if echo "$resp" | grep -q '"id"'; then
    echo "  OK"
  else
    echo "  FALHOU:"
    echo "$resp" | head -c 500
    exit 1
  fi
  rm -f /tmp/wf_update.json
}

update_workflow "$PIPELINE_ID" "GIULIA - 01 Pipeline"
update_workflow "$SCHEDULER_ID" "GIULIA - 02 Scheduler"

echo ""
echo "Token aplicado nos 2 workflows. Proximo passo: ./scripts/activate-giulia.sh"
