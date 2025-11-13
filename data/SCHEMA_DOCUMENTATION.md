# Documentação do Schema do Banco de Dados

## 📋 Resumo das Rotas API Implementadas

### Autenticação (`/api/auth`)
- `POST /api/auth/login` - Login (usuário/senha)
- `GET /api/auth/me` - Informações do usuário logado (requer auth)
- `POST /api/auth/logout` - Logout (requer auth)

### Usuários (`/api/users`)
- `GET /api/users` - Listar usuários (requer auth)
- `GET /api/users/:id` - Obter usuário por ID (requer auth)
- `POST /api/users` - Criar usuário (sem auth - registro público)
- `PUT /api/users/:id` - Atualizar usuário (requer auth)
- `DELETE /api/users/:id` - Excluir usuário (requer auth - soft delete)

### Coleções (`/api/collections`)
- `GET /api/collections` - Listar coleções do usuário autenticado (requer auth)
- `GET /api/collections/:id` - Obter coleção por ID (requer auth)
- `POST /api/collections` - Criar coleção (requer auth)
- `PUT /api/collections/:id` - Atualizar coleção (requer auth - apenas dono)
- `DELETE /api/collections/:id` - Excluir coleção (requer auth - apenas dono, soft delete)

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. Users
Armazena os usuários do sistema.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `username` (VARCHAR(100), UNIQUE) - Nome de usuário único
- `email` (VARCHAR(255), UNIQUE) - Email único
- `passwordHash` (VARCHAR(500)) - Hash da senha (bcrypt)
- `isActive` (BOOLEAN, DEFAULT true) - Status ativo/inativo
- `createdAt` (TIMESTAMP) - Data de criação
- `lastLoginAt` (TIMESTAMP, NULLABLE) - Data do último login

**Índices:**
- `idx_users_username` - Índice em username
- `idx_users_email` - Índice em email
- `idx_users_isActive` - Índice em isActive

#### 2. Collections
Armazena as coleções de fontes de dados.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `name` (VARCHAR(255)) - Nome da coleção
- `description` (TEXT, NULLABLE) - Descrição da coleção
- `ownerId` (UUID, FK → Users) - ID do usuário proprietário
- `isActive` (BOOLEAN, DEFAULT true) - Status ativo/inativo (soft delete)
- `createdAt` (TIMESTAMP) - Data de criação
- `updatedAt` (TIMESTAMP) - Data da última atualização (atualizado automaticamente)

**Índices:**
- `idx_collections_ownerId` - Índice em ownerId
- `idx_collections_isActive` - Índice em isActive
- `idx_collections_name` - Índice em name
- `idx_collections_name_owner_unique` - Índice único composto (name, ownerId) para garantir nome único por usuário

**Constraints:**
- Foreign Key: `ownerId` → `Users.id` (ON DELETE RESTRICT)
- Unique: Nome único por usuário (apenas para coleções ativas)

**Triggers:**
- `trigger_update_collections_updated_at` - Atualiza `updatedAt` automaticamente

#### 3. CollectionAccesses
Armazena as permissões de acesso às coleções.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `collectionId` (UUID, FK → Collections) - ID da coleção
- `userId` (UUID, FK → Users) - ID do usuário com acesso
- `permission` (access_permission ENUM) - Nível de permissão (Read, Write, Admin)
- `grantedAt` (TIMESTAMP) - Data em que o acesso foi concedido
- `grantedBy` (UUID, FK → Users) - ID do usuário que concedeu o acesso

**Índices:**
- `idx_collection_accesses_collectionId` - Índice em collectionId
- `idx_collection_accesses_userId` - Índice em userId
- `idx_collection_accesses_grantedBy` - Índice em grantedBy
- `idx_collection_accesses_unique` - Índice único composto (collectionId, userId)

**Constraints:**
- Foreign Key: `collectionId` → `Collections.id` (ON DELETE CASCADE)
- Foreign Key: `userId` → `Users.id` (ON DELETE CASCADE)
- Foreign Key: `grantedBy` → `Users.id` (ON DELETE RESTRICT)
- Unique: Um usuário não pode ter múltiplos acessos à mesma coleção

### Enum Types

#### access_permission
- `Read` (1) - Permissão de leitura
- `Write` (2) - Permissão de escrita
- `Admin` (3) - Permissão de administração

---

## 📝 Queries SQL de Criação

O arquivo completo com todas as queries está em: `data/migrations/001_create_tables.sql`

### Resumo das Queries Principais

```sql
-- Criar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar enum
CREATE TYPE access_permission AS ENUM ('Read', 'Write', 'Admin');

-- Criar tabela Users
CREATE TABLE "Users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "username" VARCHAR(100) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(500) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP NULL
);

-- Criar tabela Collections
CREATE TABLE "Collections" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NULL,
    "ownerId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collections_owner FOREIGN KEY ("ownerId") 
        REFERENCES "Users"("id") ON DELETE RESTRICT
);

-- Criar tabela CollectionAccesses
CREATE TABLE "CollectionAccesses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "collectionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "permission" access_permission NOT NULL,
    "grantedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" UUID NOT NULL,
    CONSTRAINT fk_collection_accesses_collection FOREIGN KEY ("collectionId") 
        REFERENCES "Collections"("id") ON DELETE CASCADE,
    CONSTRAINT fk_collection_accesses_user FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE,
    CONSTRAINT fk_collection_accesses_granted_by FOREIGN KEY ("grantedBy") 
        REFERENCES "Users"("id") ON DELETE RESTRICT
);
```

---

## 🔄 Relacionamentos

```
Users (1) ────< (N) Collections
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  │                      │
  CASCADE,
    CONSTRAINT fk_collection_accesses_user FOREIGN KEY ("userId") 
        REFERENCES "Users"("id") ON DELETE CASCADE,
    CONSTRAINT fk_collection_accesses_granted_by FOREIGN KEY ("grantedBy") 
        REFERENCES "Users"("id") ON DELETE RESTRICT
);
```

Parece que houve um problema na criação do arquivo. Vou criar novamente de forma mais simples:
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file
