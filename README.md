# Projeto: sistema de prompts — foto do local → imagem realista do projeto (IA)

Pesquisa e sistema de prompts para gerar imagens fotorrealistas de **lagos ornamentais, piscinas de areia estilo praia e paisagismo** editando por cima da foto real do local do cliente, com rascunho desenhado (legenda de cores) e imagens de referência do portfólio.

## Como navegar

| Arquivo | O que é |
|---|---|
| [`pesquisa-completa.md`](pesquisa-completa.md) | **Relatório consolidado da pesquisa** — ferramentas (ChatGPT, Gemini/Nano Banana, Higgsfield, especializadas), workflows do YouTube/fóruns, especificação da foto, aspectos jurídicos (CDC) e recomendação de stack |
| [`sistema-de-prompts.md`](sistema-de-prompts.md) | **Sistema de prompts v1** — protocolo de captura, legenda padrão do rascunho, prompt mestre (PT/EN), iterações, variações comerciais, selo/cláusula jurídica e checklist |
| [`anexos/`](anexos/) | 11 relatórios brutos da pesquisa multi-agente (com todas as fontes) + análise do workshop ArqExpress |
| [`exemplos/`](exemplos/) | Caso de teste oficial: foto aérea de drone com rascunho no Paint |

## TL;DR da pesquisa

1. O melhor motor para editar foto real preservando casa/entorno é o **Nano Banana (Google Gemini)** — não o ChatGPT (que regenera a imagem inteira).
2. O **Higgsfield** vale pelo agregado: Nano Banana Pro com pincel de máscara + multi-referência + vídeo.
3. O padrão vencedor de prompt: **foto limpa + foto marcada + legenda de cores + referências do próprio portfólio + lista explícita do que preservar**.
4. Render de IA em proposta **vincula como oferta (CDC art. 30)** — usar selo, cláusula e render fiel ao escopo orçado.
