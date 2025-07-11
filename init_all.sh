#!/bin/bash
set -e

echo "Aguardando Firecrawl iniciar..."
until curl -sf http://firecrawl:8001/health; do
  sleep 2
done

echo "Aguardando Claude Code API iniciar..."
until curl -sf http://claude-code-api:8000/health; do
  sleep 2
done

echo "Iniciando Firesearch..."
npm start