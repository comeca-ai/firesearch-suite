# Firesearch Local Suite

Este repositório entrega Firesearch, Firecrawl e Claude Code API 100% locais, totalmente integrados e prontos para rodar em seu servidor Ubuntu, sem dependências externas.

## Como usar

1. **Clone este repositório**
   ```bash
   git clone https://github.com/comeca-ai/firesearch-suite.git
   cd firesearch-suite
   ```

2. **Configure o arquivo de ambiente**
   ```bash
   cp firesearch/.env.local.example firesearch/.env.local
   # Edite conforme seu ambiente se desejar
   ```

3. **Suba tudo com Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Acesse Firesearch:**  
   http://localhost:3000

## Observações

- Firecrawl e Claude Code API só aceitam chamadas internas, não expõem portas externas.
- Firesearch é a única porta exposta (3000).
- Pode customizar variáveis no `.env.local` conforme necessidade.
- Para atualizar, basta parar, dar `git pull` e `docker-compose up --build` novamente.

## Automação

Veja o arquivo `agent.md` para um plano agentico, passo a passo, para automação do deploy.

## Suporte

Abra issues ou pull requests para melhorias!