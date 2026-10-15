#!/usr/bin/env bash
# Injeta tokens/keys nos workflows GIULIA no n8n.
# Le do ambiente (NUNCA hardcode credenciais aqui).
#
# Variaveis obrigatorias:
#   N8N_API_KEY               token admin do n8n (X-N8N-API-KEY)
#   N8N_URL                   ex: https://whats-n8n.ghikuu.easypanel.host
#   GIULIA_UAZAPI_TOKEN       token da instancia UAZAPI da Giulia
#   GIULIA_GEMINI_API_KEY     chave Gemini dedicada da Giulia
#
# Uso recomendado:
#   set -a; source .env; set +a
#   ./scripts/deploy-secrets.sh

set -euo pipefail

: "${N8N_API_KEY:?defina N8N_API_KEY (carregue do .env)}"
: "${N8N_URL:?defina N8N_URL (carregue do .env)}"
: "${GIULIA_UAZAPI_TOKEN:?defina GIULIA_UAZAPI_TOKEN}"
: "${GIULIA_GEMINI_API_KEY:?defina GIULIA_GEMINI_API_KEY}"

PIPELINE_ID="Tm1Ec80tegOqWS4N"
SCHEDULER_ID="sl6gOYuAIwvCRvOP"

update_workflow() {
  local wf_id="$1"
  local wf_name="$2"
  echo "Atualizando $wf_name ($wf_id)..."

  local current_json
  current_json=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_URL/api/v1/workflows/$wf_id")

  echo "$current_json" | UAZAPI_TOKEN="$GIULIA_UAZAPI_TOKEN" GEMINI_KEY="$GIULIA_GEMINI_API_KEY" python3 -c "
import json, sys, os
uaz = os.environ['UAZAPI_TOKEN']
gem = os.environ['GEMINI_KEY']
d = json.load(sys.stdin)
raw = json.dumps(d)
raw = raw.replace('__GIULIA_UAZAPI_TOKEN__', uaz)
raw = raw.replace('__GIULIA_GEMINI_API_KEY__', gem)
new = json.loads(raw)
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
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d @/tmp/wf_update.json \
    "$N8N_URL/api/v1/workflows/$wf_id")

  if echo "$resp" | grep -q '"id"'; then
    echo "  OK"
  else
    echo "  FALHOU:"
    echo "$resp" | head -c 500
    rm -f /tmp/wf_update.json
    exit 1
  fi
  rm -f /tmp/wf_update.json
}

update_workflow "$PIPELINE_ID" "GIULIA - 01 Pipeline"
update_workflow "$SCHEDULER_ID" "GIULIA - 02 Scheduler"

echo ""
echo "Secrets aplicados nos 2 workflows. Proximo: ./scripts/activate-giulia.sh"
