# 🧪 Guia de Testes - Delfos Backend

Este documento descreve como testar o backend da aplicação Delfos.

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **Docker** e **Docker Compose** instalados
3. **PostgreSQL** rodando (via Docker Compose)
4. Variáveis de ambiente configuradas

## 🚀 Preparação do Ambiente

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=delfos
DB_PASSWORD=delfos_password
DB_DATABASE=delfos_metadata

# JWT
JWT_SECRET=sua_chave_secreta_jwt_com_pelo_menos_32_caracteres
JWT_ISSUER=Delfos
JWT_AUDIENCE=Delfos
JWT_EXPIRES_IN=24h

# Encryption
ENCRYPTION_KEY=sua_chave_de_criptografia_base64_32_bytes

# Server
PORT=5000
NODE_ENV=development
```

**Importante:**
- `JWT_SECRET`: Use uma string aleatória com pelo menos 32 caracteres
- `ENCRYPTION_KEY`: Gere uma chave base64 de 32 bytes:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

### 3. Iniciar Banco de Dados

```bash
docker-compose up -d
```

Aguarde alguns segundos para o PostgreSQL inicializar completamente.

### 4. Executar Migrations (Opcional)

Em desenvolvimento, o TypeORM cria as tabelas automaticamente. Para produção, execute:

```bash
# Executar migrations SQL manualmente
psql -h localhost -U delfos -d delfos_metadata -f data/migrations/001_create_tables.sql
```

Ou use o TypeORM:

```bash
npm run migration:run
```

### 5. Iniciar o Servidor

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev

# Ou modo produção
npm run build
npm start
```

O servidor estará disponível em `http://localhost:5000`

## 🧪 Métodos de Teste

### Método 1: Script Automatizado (Recomendado)

Execute o script de teste automatizado:

```bash
node scripts/test-backend.js
```

Este script testa automaticamente:
- ✅ Health Check
- ✅ Criação de usuário
- ✅ Login
- ✅ Obter usuário atual
- ✅ Criar coleção
- ✅ Listar coleções
- ✅ Obter coleção por ID
- ✅ Atualizar coleção
- ✅ Excluir coleção

### Método 2: Arquivo HTTP (REST Client)

Use o arquivo `test-api.http` com extensões como:
- **VS Code**: [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- **IntelliJ IDEA**: Suporte nativo para arquivos `.http`

1. Abra o arquivo `test-api.http`
2. Execute as requisições individualmente
3. Copie o token retornado do login e cole-o na variável `@token`

### Método 3: cURL (Linha de Comando)

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Criar Usuário
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "senha123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "senha123"
  }'
```

**Copie o token retornado e use nos próximos comandos:**

#### Obter Usuário Atual
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Criar Coleção
```bash
curl -X POST http://localhost:5000/api/collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Minha Coleção",
    "description": "Descrição da coleção"
  }'
```

#### Listar Coleções
```bash
curl http://localhost:5000/api/collections \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Método 4: Postman / Insomnia

1. Importe a coleção de testes (se disponível)
2. Configure a variável de ambiente `baseUrl` = `http://localhost:5000`
3. Execute o fluxo:
   - Criar usuário → Login → Obter token
   - Configurar token nas variáveis de ambiente
   - Testar endpoints protegidos

## 📝 Checklist de Testes

### ✅ Autenticação
- [ ] Criar usuário (POST /api/users)
- [ ] Login (POST /api/auth/login)
- [ ] Obter usuário atual (GET /api/auth/me)
- [ ] Logout (POST /api/auth/logout)
- [ ] Tentar acessar endpoint protegido sem token (deve retornar 401)
- [ ] Tentar acessar com token inválido (deve retornar 401)

### ✅ Usuários
- [ ] Listar usuários (GET /api/users)
- [ ] Obter usuário por ID (GET /api/users/:id)
- [ ] Atualizar usuário (PUT /api/users/:id)
- [ ] Excluir usuário (DELETE /api/users/:id) - soft delete
- [ ] Tentar criar usuário com username duplicado (deve retornar 409)
- [ ] Tentar criar usuário com email duplicado (deve retornar 409)

### ✅ Coleções
- [ ] Criar coleção (POST /api/collections)
- [ ] Listar coleções do usuário (GET /api/collections)
- [ ] Obter coleção por ID (GET /api/collections/:id)
- [ ] Atualizar coleção (PUT /api/collections/:id)
- [ ] Excluir coleção (DELETE /api/collections/:id) - soft delete
- [ ] Tentar criar coleção com nome duplicado (deve retornar 409)
- [ ] Tentar atualizar coleção de outro usuário (deve retornar 403)
- [ ] Tentar excluir coleção de outro usuário (deve retornar 403)

### ✅ Validações
- [ ] Tentar criar coleção sem nome (deve retornar 400)
- [ ] Tentar criar coleção com nome muito longo (deve retornar 400)
- [ ] Tentar criar usuário sem campos obrigatórios (deve retornar 400)

## 🔍 Verificando o Banco de Dados

### Conectar ao PostgreSQL

```bash
docker exec -it delfos-postgres psql -U delfos -d delfos_metadata
```

### Consultas Úteis

```sql
-- Ver todos os usuários
SELECT * FROM "Users";

-- Ver todas as coleções
SELECT * FROM "Collections";

-- Ver todos os acessos
SELECT * FROM "CollectionAccesses";

-- Ver coleções com seus donos
SELECT c.*, u.username as owner_username 
FROM "Collections" c
JOIN "Users" u ON c."ownerId" = u.id;

-- Verificar índices
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public';
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se o Docker está rodando: `docker ps`
- Verifique se o PostgreSQL está ativo: `docker-compose ps`
- Verifique as variáveis de ambiente no `.env`

### Erro: "JWT configuration error"
- Verifique se `JWT_SECRET` está configurado no `.env`
- Certifique-se de que tem pelo menos 32 caracteres

### Erro: "ENCRYPTION_KEY not configured"
- Gere uma chave: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- Adicione ao `.env`

### Erro: "Table does not exist"
- Execute as migrations: `psql -h localhost -U delfos -d delfos_metadata -f data/migrations/001_create_tables.sql`
- Ou verifique se `synchronize: true` está ativo no `data-source.ts` (apenas desenvolvimento)

### Porta já em uso
- Altere a porta no `.env`: `PORT=5001`
- Ou pare o processo que está usando a porta 5000

## 📊 Resultados Esperados

Após executar todos os testes, você deve ver:

- ✅ Health check retornando `{"status":"ok","timestamp":"..."}`
- ✅ Usuário criado com sucesso (201)
- ✅ Login retornando token JWT (200)
- ✅ Coleção criada com sucesso (201)
- ✅ Listagem de coleções retornando array (200)
- ✅ Atualização funcionando (200)
- ✅ Soft delete funcionando (204)

## 🔄 Próximos Passos

Após validar os testes básicos:
1. Implementar testes unitários com Jest/Mocha
2. Implementar testes de integração
3. Configurar CI/CD com testes automatizados
4. Adicionar testes de performance
5. Implementar testes E2E completos

