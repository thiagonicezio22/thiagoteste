# Micro-serviço "orcamentos"

Preenche um modelo PowerPoint (PPTX com placeholders `{{campo}}`) e converte
em PDF via LibreOffice headless. Stateless: o n8n carrega o modelo do banco
(`giulia_orcamento_templates.arquivo_b64`) e manda tudo no request.

## Deploy no EasyPanel

1. Criar novo app → Source: este repositório, Build: Dockerfile,
   caminho `services/orcamentos`.
2. Variável de ambiente: `ORCAMENTOS_TOKEN` = token forte (o mesmo vai no
   `.env` do repo como `GIULIA_ORCAMENTOS_TOKEN` para o deploy dos workflows).
3. Porta interna: 8080. Não precisa expor publicamente — o n8n acessa pela
   rede interna do EasyPanel (`http://<nome-do-app>:8080`).
4. Fontes do modelo (ex.: Lato, Cormorant Garamond): colocar os .ttf em
   `services/orcamentos/fonts/` antes do build para o PDF sair igual ao
   PowerPoint.

## API

Todas as chamadas exigem header `X-Orcamentos-Token`.

### POST /render
```json
{
  "pptx_b64": "<modelo em base64>",
  "campos": {"cliente": "Dona Ana", "mes_ano": "Julho/2026", "investimento": "R$ 48.000"},
  "formato": "pdf"
}
```
Resposta: `{"ok": true, "pdf_b64": "...", "relatorio": {"preenchidos": [...],
"vazios": [...], "slides_removidos": 0, "formas_removidas": 0}}`

`relatorio.vazios` lista placeholders que o modelo pedia e não vieram — o
n8n usa isso para abortar antes de mandar PDF incompleto pro dono.

### POST /inspecionar
`{"pptx_b64": "..."}` → lista todos os placeholders por slide. Usado na hora
de cadastrar um modelo novo (validar a marcação antes de salvar no banco).

### GET /health
`{"ok": true}`

## Convenção de placeholders no PPTX

| Marcação | Comportamento |
|---|---|
| `{{campo}}` | Substituído pelo valor; se faltar, vira vazio e é reportado em `vazios`. |
| `{{opt:campo}}` | Igual, mas se TODOS os `opt:` de uma forma ficarem vazios, a forma inteira some do slide (cards de opção 2/3 não usados). |
| `{{opt-slide:campo}}` | Se o campo vier vazio, o slide inteiro é removido. O marcador em si nunca aparece no resultado. |

Cada placeholder deve ficar num texto próprio (uma caixa ou um parágrafo) —
a formatação do primeiro trecho do parágrafo é a que vale após a
substituição.
