FROM node:20-bullseye

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y git curl

# Clona o código do Firesearch
RUN git clone https://github.com/mendableai/firesearch.git .

# Instala dependências do Node.js
RUN npm install

# Build do projeto (Next.js produção)
RUN npm run build

# Copia entrypoint (init_all.sh) para aguardar dependências
COPY ../init_all.sh /app/init_all.sh
RUN chmod +x /app/init_all.sh

# Expõe a porta do Next.js
EXPOSE 3000

CMD ["/app/init_all.sh"]