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

set -euo pipefail

: "${N8N_API_KEY:?defina N8N_API_KEY}"
: "${N8N_URL:?defina N8N_URL}"
: "${GIULIA_UAZAPI_TOKEN:?defina GIULIA_UAZAPI_TOKEN}"
: "${GIULIA_GEMINI_API_KEY:?defina GIULIA_GEMINI_API_KEY}"

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
  UAZAPI_TOKEN="$GIULIA_UAZAPI_TOKEN" GEMINI_KEY="$GIULIA_GEMINI_API_KEY" python3 << PYEOF > /tmp/wf_put.json
import json, os
with open('$local_file') as f:
    d = json.load(f)
raw = json.dumps(d)
raw = raw.replace('__GIULIA_UAZAPI_TOKEN__', os.environ['UAZAPI_TOKEN'])
raw = raw.replace('__GIULIA_GEMINI_API_KEY__', os.environ['GEMINI_KEY'])
new = json.loads(raw)
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
    curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_URL/api/v1/workflows/$wf_id/activate" \
      | python3 -c "import json,sys; d=json.load(sys.stdin); print('  active:', d.get('active'))"
  fi
}

deploy "Tm1Ec80tegOqWS4N" "workflows/01-GIULIA-Pipeline.json" "GIULIA - 01 Pipeline"
deploy "sl6gOYuAIwvCRvOP" "workflows/02-GIULIA-Scheduler.json" "GIULIA - 02 Scheduler"

echo ""
echo "Workflows deployados com secrets injetados."
