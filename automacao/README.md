# Automação — gerar renders via API do Gemini (Nano Banana Pro)

Para quando o fluxo manual (app Gemini / Higgsfield) estiver validado e o volume crescer. Vantagens da API: sem limite diário de plano, 4K nativo, proporção da foto preservada automaticamente e prompt padronizado (impossível esquecer o bloco de preservação).

## Passo a passo (uma vez só)

1. Crie a chave em https://aistudio.google.com/apikey — este modelo exige **billing ativo** (cartão cadastrado). Custo: ~US$ 0,134/imagem (1K-2K) e ~US$ 0,24 (4K).
2. Instale: `pip install google-genai pillow`
3. Defina a chave: `export GEMINI_API_KEY="sua-chave"` (não coloque a chave em arquivo do repositório).

## Uso por projeto

```bash
python gerar_render.py \
  --foto quintal.jpg \
  --rascunho quintal-marcado.jpg \
  --ref obra1.jpg \
  --projeto "piscina natural de areia estilo praia" \
  --medidas "9 x 6 m" \
  --detalhes "cascata baixa de pedra à esquerda" \
  --preservar "a churrasqueira; a cerca viva à direita" \
  --resolucao 2K --variacoes 3
```

Gera `render-quintal-1.png`, `-2.png`, `-3.png`. Use `--aereo` para foto de drone e `--resolucao 4K` para a arte final da proposta.

## Observações

- O prompt montado é o mesmo prompt mestre do `sistema-de-prompts.md` (legenda padrão de cores incluída).
- Rascunhos baratos: troque `MODELO` no script para `gemini-3.1-flash-image` (~1/3 do custo).
- Nomes de modelo e parâmetros conferidos em ago/2026 na doc oficial (https://ai.google.dev/gemini-api/docs/image-generation) — se o script acusar modelo inexistente, confira o nome atual lá.
- Privacidade: na API os dados **não** são usados para treinar modelos (diferente do app gratuito) — adequado para fotos de imóveis de clientes.
- Próximo nível (como o case Arrowhead): ligar este script a um formulário (Google Forms/WhatsApp) para o vendedor gerar o render ainda na visita.
