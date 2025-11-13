# 🔐 Configuração das Credenciais do Banco de Dados

## 📍 Onde Colocar as Credenciais

As credenciais do banco de dados devem ser configuradas no arquivo **`.env`** na **raiz do projeto**.

## 🚀 Passo a Passo

### 1. Criar o arquivo `.env`

Na raiz do projeto (`C:\Projetos\tcc\delfos\backend`), crie um arquivo chamado `.env`

### 2. Configurar as Variáveis

Copie o conteúdo abaixo e ajuste conforme suas credenciais:

```env
# =====================================================
# Configuração do Banco de Dados PostgreSQL
# =====================================================
# Ajuste estas variáveis conforme seu container Docker

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=seu_usuario_aqui
DB_PASSWORD=sua_senha_aqui
DB_DATABASE=seu_banco_aqui

# =====================================================
# Configuração JWT (Autenticação)
# =====================================================
# IMPORTANTE: Use uma chave secreta com pelo menos 32 caracteres

JWT_SECRET=sua_chave_secreta_jwt_com_pelo_menos_32_caracteres_aqui
JWT_ISSUER=Delfos
JWT_AUDIENCE=Delfos
JWT_EXPIRES_IN=24h

# =====================================================
# Configuração de Criptografia
# =====================================================
# Gere uma chave base64 de 32 bytes

ENCRYPTION_KEY=sua_chave_de_criptografia_base64_32_bytes_aqui

# =====================================================
# Configuração do Servidor
# =====================================================

PORT=5000
NODE_ENV=development
```

### 3. Obter as Credenciais do Seu Container

Se você não souber as credenciais do seu container PostgreSQL, execute:

```powershell
# Ver informações do container
docker ps

# Ver variáveis de ambiente do container PostgreSQL
docker inspect nome_do_seu_container_postgres | Select-String -Pattern "POSTGRES"
```

Ou verifique o `docker-compose.yml` do seu outro projeto.

### 4. Gerar Chaves Necessárias

#### Gerar JWT_SECRET:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Gerar ENCRYPTION_KEY:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📝 Exemplo Completo

Se seu banco PostgreSQL está configurado assim:
- **Host:** localhost
- **Porta:** 5432
- **Usuário:** postgres
- **Senha:** minha_senha_secreta
- **Banco:** delfos_db

Seu `.env` ficaria:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=minha_senha_secreta
DB_DATABASE=delfos_db

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_ISSUER=Delfos
JWT_AUDIENCE=Delfos
JWT_EXPIRES_IN=24h

ENCRYPTION_KEY=YWJjZGVmZ2hpamsxMjM0NTY3ODkwYWJjZGVmZ2hpamsxMjM0NTY3ODkw

PORT=5000
NODE_ENV=development
```

## ✅ Verificar se Está Funcionando

Após criar o arquivo `.env`, teste a conexão:

```powershell
# Iniciar o servidor
npm run dev
```

Se tudo estiver correto, você verá:
```
Database connection established
Server running on port 5000
```

Se houver erro de conexão, verifique:
1. ✅ O container PostgreSQL está rodando (`docker ps`)
2. ✅ As credenciais no `.env` estão corretas
3. ✅ A porta está acessível (se não for localhost, verifique o IP do container)
4. ✅ O banco de dados existe no PostgreSQL

## 🔍 Troubleshooting

### Erro: "Cannot connect to database"

**Se o banco está em outro container Docker:**

1. **Descobrir o IP do container:**
   ```powershell
   docker inspect nome_do_container | Select-String -Pattern "IPAddress"
   ```

2. **Usar o IP no DB_HOST:**
   ```env
   DB_HOST=172.17.0.2  # Use o IP do seu container
   ```

3. **Ou usar o nome do container (se estiver na mesma rede Docker):**
   ```env
   DB_HOST=nome_do_container_postgres
   ```

### Erro: "password authentication failed"

- Verifique se a senha no `.env` está correta
- Verifique se há espaços extras antes/depois da senha
- Certifique-se de que não há aspas nas variáveis (exceto se necessário)

### Erro: "database does not exist"

- Verifique se o banco de dados existe no PostgreSQL
- Crie o banco se necessário:
  ```sql
  CREATE DATABASE delfos_metadata;
  ```

## 📚 Variáveis Lidas pelo Código

O código lê as variáveis de ambiente do arquivo `.env` através do `dotenv.config()` no `server.ts`.

As variáveis são usadas em:
- `src/infrastructure/data/data-source.ts` - Conexão com banco
- `src/server.ts` - Configuração do servidor e serviços
- `src/api/middleware/authMiddleware.ts` - Autenticação JWT

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- O arquivo `.env` está no `.gitignore` e **NÃO** será commitado
- **NUNCA** compartilhe suas credenciais
- Use credenciais diferentes para desenvolvimento e produção
- Em produção, use variáveis de ambiente do sistema ou um gerenciador de secrets

