# Firesearch autosuficiente para Ubuntu Server

FROM node:20-bullseye

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Define diretório de trabalho
WORKDIR /app

# Clona o código do Firesearch
RUN git clone https://github.com/mendableai/firesearch.git .

# Instala dependências do Node.js
RUN npm install

# Build do projeto (Next.js em modo produção)
RUN npm run build

# Copia um .env.local de exemplo (pode ser sobrescrito no docker run)
COPY .env.local.example .env.local

# Porta padrão Next.js
EXPOSE 3000

# Comando de inicialização em produção
CMD ["npm", "start"]