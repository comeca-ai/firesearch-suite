FROM node:20-bullseye

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copia os arquivos da aplicação local
COPY package.json ./
COPY server.js ./

# Instala dependências do Node.js
RUN npm install --production

# Copia o arquivo de exemplo de environment
COPY .env.local.example /app/.env.local

# Copia entrypoint (init_all.sh) para aguardar dependências
COPY init_all.sh /app/init_all.sh
RUN chmod +x /app/init_all.sh

# Expõe a porta do servidor
EXPOSE 3000

CMD ["/app/init_all.sh"]