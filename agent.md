# Plano Agentico: Deploy Total do Firesearch Suite Local

Este documento serve como instrução para um agente executar do zero a implantação do stack Firesearch + Firecrawl + Claude Code API, tudo rodando localmente, integrado e seguro, via Docker Compose.

---

## 1. Pré-requisitos

- Ubuntu Server (ou ambiente Linux compatível)
- Docker e Docker Compose instalados
- Acesso à Internet para baixar imagens e dependências
- (Opcional) Git instalado para clonar repositórios

---

## 2. Passos de Execução

### 2.1. Clonar o Repositório Principal

Se não existir, crie uma pasta de trabalho.  
Clone o repositório do projeto:

```bash
git clone https://github.com/comeca-ai/firesearch-suite.git
cd firesearch-suite
```

### 2.2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo de variáveis:

```bash
cp firesearch/.env.local.example firesearch/.env.local
```

Se desejar personalizar chaves, edite `firesearch/.env.local`. Os valores padrões já funcionam para uso local privado.

### 2.3. Construir e Subir os Contêineres

Execute o Docker Compose para levantar todos os serviços:

```bash
docker-compose up --build
```

O agente deve monitorar os logs e garantir que:
- Todos os serviços partam sem erro (firecrawl, claude-code-api, firesearch)
- Firesearch aguarde até os serviços internos estarem saudáveis antes de iniciar

### 2.4. Validar Saúde dos Serviços

O agente deve verificar:

- Firecrawl: `http://localhost:8001/health` (de dentro da rede docker)
- Claude Code API: `http://localhost:8000/health`
- Firesearch: `http://localhost:3000` (externo)

Use curl ou browser para checar respostas JSON de saúde.

### 2.5. Testar a Integração Completa

- Acesse http://localhost:3000
- Realize uma pesquisa de teste no Firesearch
- Certifique-se que as respostas sejam processadas sem erros, com scraping e LLM funcionando
- Verifique nos logs se todas as APIs chamadas são locais (firecrawl & claude-code-api)

### 2.6. Ajustes Finais e Segurança

- O agente deve garantir que só a porta 3000 (Firesearch) está exposta externamente
- Assegure que Firecrawl e Claude Code API só aceitam conexões internas (network do compose)
- (Opcional) Revise permissões de arquivos, volumes e logs

---

## 3. Manutenção e Atualização

Para atualizar qualquer serviço:
1. Pare o compose: `docker-compose down`
2. Faça `git pull` no repositório
3. Rode `docker-compose up --build` novamente

Para logs em tempo real:

```bash
docker-compose logs -f
```

---

## 4. Troubleshooting (Resolução de Problemas)

- Se um serviço não sobe, cheque as variáveis de ambiente e dependências
- Use `docker-compose ps` e `docker-compose logs` para diagnosticar
- Verifique se há conflitos de portas

---

## 5. Remover o Stack

```bash
docker-compose down -v --remove-orphans
```

---

## 6. Observações Finais

- Este stack é seguro para uso local e privado, sem chamadas cloud.
- Todos os serviços são plug-and-play via Docker.
- Para escalar, basta replicar o procedimento em outro servidor.

---

**Agente:** Execute cada etapa acima na ordem, validando os resultados intermediários e reportando qualquer falha ou ajuste necessário.