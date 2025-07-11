#!/bin/bash
set -e

echo "Aguardando Firecrawl iniciar..."
until curl -sf http://firecrawl:8001/health > /dev/null 2>&1 || curl -sf http://firecrawl:8001/api/health > /dev/null 2>&1 || curl -sf http://firecrawl:8001/ > /dev/null 2>&1; do
  echo "Tentando conectar ao Firecrawl..."
  sleep 3
done
echo "Firecrawl está pronto!"

echo "Aguardando Claude Code API iniciar..."
until curl -sf http://claude-code-api:8000/health > /dev/null 2>&1 || curl -sf http://claude-code-api:8000/api/health > /dev/null 2>&1 || curl -sf http://claude-code-api:8000/ > /dev/null 2>&1; do
  echo "Tentando conectar ao Claude Code API..."
  sleep 3
done
echo "Claude Code API está pronto!"

echo "Todos os serviços estão prontos. Iniciando Firesearch..."
exec node server.js