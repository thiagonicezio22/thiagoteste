# Micro-servico de orcamentos: python-pptx (preenchimento) +
# LibreOffice headless (PPTX -> PDF). Porta 8080.
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libreoffice-impress \
        fonts-liberation \
        fonts-dejavu-core \
        fonts-crosextra-carlito \
        fonts-crosextra-caladea \
        fontconfig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Fontes proprias do modelo (ex: Lato, Cormorant) podem ser adicionadas em
# ./fonts — sao instaladas no sistema para o LibreOffice renderizar igual
# ao PowerPoint.
COPY fonts* /usr/share/fonts/truetype/orcamentos/
RUN fc-cache -f

EXPOSE 8080
CMD ["gunicorn", "-b", "0.0.0.0:8080", "-w", "2", "--timeout", "300", "app:app"]
