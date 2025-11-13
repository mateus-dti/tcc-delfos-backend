#!/usr/bin/env node

/**
 * Script de Teste do Backend Delfos
 * 
 * Este script testa todos os endpoints principais da API
 * Requer: Node.js e servidor rodando em http://localhost:5000
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let userId = '';
let collectionId = '';

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test(name, fn) {
  try {
    log(`\n🧪 Testando: ${name}`, 'cyan');
    await fn();
    log(`✅ ${name} - PASSOU`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name} - FALHOU: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'yellow');
      log(`   Body: ${JSON.stringify(error.response.body, null, 2)}`, 'yellow');
    }
    return false;
  }
}

async function runTests() {
  log('\n🚀 Iniciando testes do Backend Delfos\n', 'blue');
  log('='.repeat(50), 'blue');

  let passed = 0;
  let failed = 0;

  // 1. Health Check
  await test('Health Check', async () => {
    const response = await makeRequest('GET', '/health');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    log(`   Status: ${response.status}`, 'yellow');
    log(`   Response: ${JSON.stringify(response.body)}`, 'yellow');
  }) && passed++ || failed++;

  // 2. Criar usuário
  await test('Criar Usuário', async () => {
    const response = await makeRequest('POST', '/api/users', {
      username: 'testuser_' + Date.now(),
      email: `test_${Date.now()}@example.com`,
      password: 'senha123',
    });
    if (response.status !== 201) {
      throw new Error(`Expected 201, got ${response.status}`);
    }
    userId = response.body.id;
    log(`   Usuário criado: ${userId}`, 'yellow');
  }) && passed++ || failed++;

  // 3. Login
  await test('Login', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      username: 'testuser_' + (Date.now() - 1000), // Usar username criado
      password: 'senha123',
    });
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    authToken = response.body.token;
    log(`   Token obtido: ${authToken.substring(0, 20)}...`, 'yellow');
  }) && passed++ || failed++;

  // 4. Obter usuário atual
  await test('Obter Usuário Atual', async () => {
    const response = await makeRequest('GET', '/api/auth/me', null, authToken);
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    log(`   Usuário: ${response.body.username}`, 'yellow');
  }) && passed++ || failed++;

  // 5. Criar coleção
  await test('Criar Coleção', async () => {
    const response = await makeRequest(
      'POST',
      '/api/collections',
      {
        name: 'Coleção de Teste',
        description: 'Descrição da coleção de teste',
      },
      authToken
    );
    if (response.status !== 201) {
      throw new Error(`Expected 201, got ${response.status}`);
    }
    collectionId = response.body.id;
    log(`   Coleção criada: ${collectionId}`, 'yellow');
  }) && passed++ || failed++;

  // 6. Listar coleções
  await test('Listar Coleções', async () => {
    const response = await makeRequest('GET', '/api/collections', null, authToken);
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    log(`   Total de coleções: ${response.body.length}`, 'yellow');
  }) && passed++ || failed++;

  // 7. Obter coleção por ID
  await test('Obter Coleção por ID', async () => {
    const response = await makeRequest(
      'GET',
      `/api/collections/${collectionId}`,
      null,
      authToken
    );
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    log(`   Coleção: ${response.body.name}`, 'yellow');
  }) && passed++ || failed++;

  // 8. Atualizar coleção
  await test('Atualizar Coleção', async () => {
    const response = await makeRequest(
      'PUT',
      `/api/collections/${collectionId}`,
      {
        name: 'Coleção Atualizada',
        description: 'Nova descrição',
      },
      authToken
    );
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    log(`   Coleção atualizada: ${response.body.name}`, 'yellow');
  }) && passed++ || failed++;

  // 9. Excluir coleção (soft delete)
  await test('Excluir Coleção', async () => {
    const response = await makeRequest(
      'DELETE',
      `/api/collections/${collectionId}`,
      null,
      authToken
    );
    if (response.status !== 204) {
      throw new Error(`Expected 204, got ${response.status}`);
    }
    log(`   Coleção excluída (soft delete)`, 'yellow');
  }) && passed++ || failed++;

  // Resumo
  log('\n' + '='.repeat(50), 'blue');
  log(`\n📊 Resumo dos Testes:`, 'blue');
  log(`   ✅ Passou: ${passed}`, 'green');
  log(`   ❌ Falhou: ${failed}`, 'red');
  log(`   📈 Total: ${passed + failed}`, 'cyan');
  log('\n');
}

// Executar testes
runTests().catch((error) => {
  log(`\n❌ Erro ao executar testes: ${error.message}`, 'red');
  process.exit(1);
});

