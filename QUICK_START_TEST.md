# 🚀 Quick Start - Testar Backend

## Passo a Passo Rápido

### 1️⃣ Iniciar Banco de Dados

```powershell
# No PowerShell
cd C:\Projetos\tcc\delfos\backend
docker-compose up -d
```

Aguarde alguns segundos e verifique:
```powershell
docker-compose ps
```

### 2️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=delfos
DB_PASSWORD=delfos_password
DB_DATABASE=delfos_metadata

JWT_SECRET=minha_chave_secreta_super_segura_com_mais_de_32_caracteres_123456789
JWT_ISSUER=Delfos
JWT_AUDIENCE=Delfos
JWT_EXPIRES_IN=24h

ENCRYPTION_KEY=GereUmaChaveBase64De32BytesUsandoOCodigoAbaixo
PORT=5000
NODE_ENV=development
```

**Gerar chave de criptografia:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3️⃣ Instalar Dependências (se ainda não fez)

```powershell
npm install
```

### 4️⃣ Iniciar o Servidor

```powershell
npm run dev
```

Você deve ver:
```
Database connection established
Server running on port 5000
Environment: development
```

### 5️⃣ Testar a API

#### Opção A: Script Automatizado

Em outro terminal:
```powershell
node scripts/test-backend.js
```

#### Opção B: cURL Manual

**Health Check:**
```powershell
curl http://localhost:5000/health
```

**Criar Usuário:**
```powershell
curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"senha123\"}'
```

**Login (copie o token):**
```powershell
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{\"username\":\"testuser\",\"password\":\"senha123\"}'
```

**Criar Coleção (substitua SEU_TOKEN):**
```powershell
curl -X POST http://localhost:5000/api/collections -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d '{\"name\":\"Minha Coleção\",\"description\":\"Descrição\"}'
```

**Listar Coleções:**
```powershell
curl http://localhost:5000/api/collections -H "Authorization: Bearer SEU_TOKEN"
```

## ✅ Verificação Rápida

Se tudo estiver funcionando, você deve conseguir:

1. ✅ Ver `{"status":"ok"}` no `/health`
2. ✅ Criar um usuário e receber `201 Created`
3. ✅ Fazer login e receber um token JWT
4. ✅ Criar uma coleção e receber `201 Created`
5. ✅ Listar coleções e ver sua coleção criada

## 🐛 Problemas Comuns

**Erro de conexão com banco:**
- Verifique se Docker está rodando: `docker ps`
- Inicie o PostgreSQL: `docker-compose up -d`

**Erro de JWT:**
- Verifique se `JWT_SECRET` tem pelo menos 32 caracteres no `.env`

**Porta em uso:**
- Altere `PORT=5001` no `.env` ou pare o processo na porta 5000

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `TESTING.md` - Guia completo de testes
- `test-api.http` - Arquivo HTTP para REST Client
- `scripts/test-backend.js` - Script de teste automatizado

