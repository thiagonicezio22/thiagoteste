#!/usr/bin/env bash
# Desativa os 2 workflows GIULIA no n8n (kill switch).
# Util pra pausar a Giulia sem deletar nada.
#
# Le do ambiente:
#   N8N_API_KEY   token admin do n8n
#   N8N_URL       ex: https://whats-n8n.ghikuu.easypanel.host

set -euo pipefail

: "${N8N_API_KEY:?defina N8N_API_KEY (carregue do .env)}"
: "${N8N_URL:?defina N8N_URL (carregue do .env)}"

for id in "Tm1Ec80tegOqWS4N" "sl6gOYuAIwvCRvOP"; do
  echo "Desativando $id..."
  curl -s -X POST \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "$N8N_URL/api/v1/workflows/$id/deactivate" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print('  active:', d.get('active'), '-', d.get('name'))"
done

echo "Giulia desativada. Mensagens nao serao processadas."
