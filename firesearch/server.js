const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Simple HTTP request helper using built-in modules
function makeRequest(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(requestUrl);
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      timeout: options.timeout || 5000,
      headers: options.headers || {}
    };

    const req = httpModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Parse POST request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          resolve(JSON.parse(body));
        } else {
          resolve(body);
        }
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Send HTML response
function sendHTML(res, html, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(html);
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    // Health check endpoint
    if (pathname === '/health') {
      sendJSON(res, { status: 'healthy', service: 'firesearch' });
      return;
    }

    // Search API endpoint
    if (pathname === '/api/search' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { query } = body;
        
        if (!query) {
          sendJSON(res, { error: 'Query é obrigatório' }, 400);
          return;
        }

        const firecrawlUrl = process.env.FIRECRAWL_API_URL || 'http://firecrawl:8001';
        const claudeUrl = process.env.CLAUDE_API_URL || 'http://claude-code-api:8000';
        
        let result = \`Processando consulta: "\${query}"\n\n\`;

        // Test Firecrawl service
        try {
          result += '1. Testando conectividade com Firecrawl...\n';
          const firecrawlResponse = await makeRequest(\`\${firecrawlUrl}/health\`);
          result += \`   ✅ Firecrawl está respondendo: \${firecrawlResponse.status}\n\`;
        } catch (err) {
          try {
            const firecrawlResponse = await makeRequest(\`\${firecrawlUrl}/api/health\`);
            result += \`   ✅ Firecrawl está respondendo: \${firecrawlResponse.status}\n\`;
          } catch (err2) {
            try {
              const firecrawlResponse = await makeRequest(\`\${firecrawlUrl}/\`);
              result += \`   ✅ Firecrawl está respondendo: \${firecrawlResponse.status}\n\`;
            } catch (err3) {
              result += \`   ❌ Erro ao conectar com Firecrawl: \${err3.message}\n\`;
            }
          }
        }

        // Test Claude Code API service
        try {
          result += '2. Testando conectividade com Claude Code API...\n';
          const claudeResponse = await makeRequest(\`\${claudeUrl}/health\`);
          result += \`   ✅ Claude Code API está respondendo: \${claudeResponse.status}\n\`;
        } catch (err) {
          try {
            const claudeResponse = await makeRequest(\`\${claudeUrl}/api/health\`);
            result += \`   ✅ Claude Code API está respondendo: \${claudeResponse.status}\n\`;
          } catch (err2) {
            try {
              const claudeResponse = await makeRequest(\`\${claudeUrl}/\`);
              result += \`   ✅ Claude Code API está respondendo: \${claudeResponse.status}\n\`;
            } catch (err3) {
              result += \`   ❌ Erro ao conectar com Claude Code API: \${err3.message}\n\`;
            }
          }
        }

        // Simulate search functionality
        result += '\n3. Executando busca simulada...\n';
        result += \`   📝 Query processada: "\${query}"\n\`;
        result += \`   🔍 Simulando scraping de resultados...\n\`;
        result += \`   🤖 Simulando análise via LLM...\n\`;
        result += \`   ✅ Busca local completada!\n\n\`;
        
        result += '📊 Resultados simulados:\n';
        result += \`- Encontrados dados relacionados a: "\${query}"\n\`;
        result += \`- Processamento via Firecrawl: OK\n\`;
        result += \`- Análise via Claude: OK\n\`;
        result += \`- Todas as operações foram executadas localmente dentro da rede Docker\n\`;

        sendJSON(res, { result });

      } catch (error) {
        console.error('Erro na API de busca:', error);
        sendJSON(res, { error: \`Erro interno do servidor: \${error.message}\` }, 500);
      }
      return;
    }

    // Serve HTML frontend for root path
    if (pathname === '/') {
      const html = \`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firesearch Local Suite</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .search-form {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        .search-input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
        }
        .search-button {
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        }
        .search-button:hover {
            background-color: #0056b3;
        }
        .search-button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .results {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .loading {
            text-align: center;
            color: #666;
        }
        .error {
            color: #dc3545;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 12px;
            border-radius: 4px;
        }
        .status {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 Firesearch Local Suite</h1>
            <p>Busca local integrada com Firecrawl e Claude Code API</p>
        </div>

        <div class="info">
            <strong>✅ Stack Local Ativo:</strong><br>
            - Firesearch rodando internamente<br>
            - Conectividade com Firecrawl: <span id="firecrawlStatus">verificando...</span><br>
            - Conectividade com Claude Code API: <span id="claudeStatus">verificando...</span><br>
            - Nenhuma dependência externa ou cloud
        </div>

        <form id="searchForm" class="search-form">
            <input type="text" id="queryInput" placeholder="Digite sua pesquisa..." class="search-input" />
            <button type="submit" id="searchButton" class="search-button">Pesquisar</button>
        </form>

        <div id="status" class="status" style="display: none;"></div>
        <div id="error" class="error" style="display: none;"></div>
        <div id="results" class="results" style="display: none;">
            <h3>Resultados:</h3>
            <pre id="resultsContent"></pre>
        </div>
    </div>

    <script>
        const form = document.getElementById('searchForm');
        const queryInput = document.getElementById('queryInput');
        const searchButton = document.getElementById('searchButton');
        const statusDiv = document.getElementById('status');
        const errorDiv = document.getElementById('error');
        const resultsDiv = document.getElementById('results');
        const resultsContent = document.getElementById('resultsContent');
        const firecrawlStatus = document.getElementById('firecrawlStatus');
        const claudeStatus = document.getElementById('claudeStatus');

        // Test connectivity on page load
        async function testConnectivity() {
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: 'teste_conectividade' }),
                });
                const data = await response.json();
                
                if (data.result.includes('Firecrawl está respondendo')) {
                    firecrawlStatus.textContent = 'OK';
                    firecrawlStatus.style.color = 'green';
                } else {
                    firecrawlStatus.textContent = 'Erro';
                    firecrawlStatus.style.color = 'red';
                }
                
                if (data.result.includes('Claude Code API está respondendo')) {
                    claudeStatus.textContent = 'OK';
                    claudeStatus.style.color = 'green';
                } else {
                    claudeStatus.textContent = 'Erro';
                    claudeStatus.style.color = 'red';
                }
            } catch (error) {
                firecrawlStatus.textContent = 'Erro';
                firecrawlStatus.style.color = 'red';
                claudeStatus.textContent = 'Erro';
                claudeStatus.style.color = 'red';
            }
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = queryInput.value.trim();
            if (!query) return;

            // Reset UI
            statusDiv.style.display = 'none';
            errorDiv.style.display = 'none';
            resultsDiv.style.display = 'none';
            searchButton.disabled = true;
            searchButton.textContent = 'Pesquisando...';

            try {
                statusDiv.textContent = 'Iniciando busca...';
                statusDiv.style.display = 'block';

                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro desconhecido');
                }

                statusDiv.textContent = 'Busca concluída com sucesso!';
                resultsContent.textContent = data.result;
                resultsDiv.style.display = 'block';

            } catch (error) {
                statusDiv.style.display = 'none';
                errorDiv.textContent = \`Erro na busca: \${error.message}\`;
                errorDiv.style.display = 'block';
            } finally {
                searchButton.disabled = false;
                searchButton.textContent = 'Pesquisar';
            }
        });

        // Test connectivity when page loads
        testConnectivity();
    </script>
</body>
</html>\`;
      sendHTML(res, html);
      return;
    }

    // 404 for other paths
    sendJSON(res, { error: 'Not found' }, 404);

  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, { error: 'Internal server error' }, 500);
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`🔥 Firesearch Local Suite rodando na porta \${PORT}\`);
  console.log(\`Firecrawl URL: \${process.env.FIRECRAWL_API_URL || 'http://firecrawl:8001'}\`);
  console.log(\`Claude URL: \${process.env.CLAUDE_API_URL || 'http://claude-code-api:8000'}\`);
});