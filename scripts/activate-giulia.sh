#!/usr/bin/env bash
# Ativa os 2 workflows GIULIA no n8n.
# Pre-requisito: ja ter rodado deploy-token.sh com o token UAZAPI da Giulia.

set -euo pipefail

API_KEY="${N8N_API_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MWI5Zjc1OC1iMTJhLTRlNmEtYTI2OC0wMWQ3Y2MzNjhhOGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTI3ZDliNGQtZGY4MC00MGFmLTk0NTMtNGNjYTA3MGEyZTg1IiwiaWF0IjoxNzc0NTM5MTI1fQ.O3vnGOI_9OSZJiti3lEKvumTPNM8jMymRVc9Dvnke9w}"
N8N_URL="${N8N_URL:-https://whats-n8n.ghikuu.easypanel.host}"

PIPELINE_ID="Tm1Ec80tegOqWS4N"
SCHEDULER_ID="sl6gOYuAIwvCRvOP"

for id in "$PIPELINE_ID" "$SCHEDULER_ID"; do
  echo "Ativando $id..."
  curl -s -X POST \
    -H "X-N8N-API-KEY: $API_KEY" \
    "$N8N_URL/api/v1/workflows/$id/activate" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print('  active:', d.get('active'), '-', d.get('name'))"
done

echo ""
echo "Pronto. Manda uma mensagem do seu WhatsApp pro numero da Giulia."
