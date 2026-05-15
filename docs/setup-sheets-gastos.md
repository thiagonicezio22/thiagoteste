# Setup Google Sheets pra sincronizar gastos

A Giulia já registra gastos no Postgres assim que você manda mensagem. Esse setup conecta a **planilha do Drive** pra ela espelhar tudo lá em até 5 minutos.

## Passo 1 — Criar a planilha

1. Acesse `https://sheets.new` (cria planilha em branco)
2. Renomeie pra `Giulia - Gastos Pessoais` (ou outro nome que preferir)
3. Renomeie a aba (canto inferior, default "Página1") pra `Gastos`
4. Na **linha 1**, cole os cabeçalhos exatamente nessa ordem (uma célula por coluna):

```
ID | Data | Descricao | Valor | Categoria | Forma Pagamento | Tags | Observacoes | Registrado em
```

5. Anote a **URL da planilha**. Ela tem o formato `https://docs.google.com/spreadsheets/d/XXXXXXXX/edit`. O **XXXXXXXX** é o **documentId** (vou precisar).

## Passo 2 — Conectar Google Sheets no n8n

1. Abre `https://whats-n8n.ghikuu.easypanel.host/credentials`
2. Clica **Add Credential** → procura **Google Sheets OAuth2 API**
3. Nome: `Google Sheets Giulia`
4. Clica em **Sign in with Google** → aprova com a conta Google que criou a planilha
5. Salva
6. Volta na lista de credenciais e **copia o ID** da credencial recém-criada (aparece na URL quando você abre ela: `/credentials/XXXXX` ou no menu de detalhes)

## Passo 3 — Me passar 3 informações

Cola aqui no chat:

```
SHEET_DOC_ID=cole-aqui-o-XXXXXXXX-da-URL
SHEET_TAB=Gastos        (ou nome da aba se mudou)
SHEET_CRED_ID=cole-aqui-o-id-da-credencial-n8n
```

Eu aplico nos placeholders do workflow, deployo e ativo. Em 5 min você vê os gastos aparecendo na planilha.

## Como ela funciona depois de configurada

- Você manda `gastei 50 no almoço` ou `uber 35 cartão` ou qualquer texto/audio
- Giulia categoriza com Gemini e salva no Postgres
- A cada 5 min o workflow `GIULIA - 03 Sync Gastos Sheets` pega o que está com `sheets_synced = false` e adiciona como linha nova na planilha
- Marca como sincronizado pra não duplicar

## Se editar/deletar gasto

O `editar_gasto` marca `sheets_synced = false` automaticamente, então o sync vai adicionar uma linha duplicada na planilha (não atualiza in-place). O `deletar_gasto` apaga do Postgres mas **não remove a linha da planilha** — você apaga manualmente se quiser.

(Pra resolver isso direito eu precisaria do `row_number` da linha na planilha junto com cada gasto, que é mais setup. Por ora, edição/deleção fica só no banco e a planilha pode ficar com dado obsoleto. Posso melhorar depois.)
