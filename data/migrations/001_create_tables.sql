-- =====================================================
-- Script de Criação de Tabelas - Delfos Backend
-- Baseado nas entidades TypeORM existentes
-- PostgreSQL 16+
-- =====================================================

-- Criar extensão para UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENUMS
-- =====================================================
CREATE TYPE access_permission AS ENUM ('Read', 'Write', 'Admin');
CREATE TYPE user_role AS ENUM ('default', 'manager', 'admin');

-- =====================================================
-- 2. TABELA: Users
-- =====================================================
CREATE TABLE IF NOT EXISTS "Users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "username" VARCHAR(100) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(500) NOT NULL,
    "role" user_role NOT NULL DEFAULT 'default',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP NULL
);

-- Índices para Users
CREATE INDEX IF NOT EXISTS idx_users_username ON "Users"("username");
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"("email");
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users"("role");
CREATE INDEX IF NOT EXISTS idx_users_isActive ON "Users"("isActive");

-- Comentários na tabela Users
COMMENT ON TABLE "Users" IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN "Users"."id" IS 'Identificador único do usuário (UUID)';
COMMENT ON COLUMN "Users"."username" IS 'Nome de usuário único';
COMMENT ON COLUMN "Users"."email" IS 'Email único do usuário';
COMMENT ON COLUMN "Users"."passwordHash" IS 'Hash da senha do usuário (bcrypt)';
COMMENT ON COLUMN "Users"."role" IS 'Role do usuário: default, manager ou admin';
COMMENT ON COLUMN "Users"."isActive" IS 'Indica se o usuário está ativo';
COMMENT ON COLUMN "Users"."createdAt" IS 'Data de criação do usuário';
COMMENT ON COLUMN "Users"."lastLoginAt" IS 'Data do último login do usuário';

-- =====================================================
-- 3. TABELA: Collections
-- =====================================================
CREATE TABLE IF NOT EXISTS "Collections" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NULL,
    "ownerId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collections_owner FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE RESTRICT
);

-- Índices para Collections
CREATE INDEX IF NOT EXISTS idx_collections_ownerId ON "Collections"("ownerId");
CREATE INDEX IF NOT EXISTS idx_collections_isActive ON "Collections"("isActive");
CREATE INDEX IF NOT EXISTS idx_collections_name ON "Collections"("name");

-- Índice único composto para garantir nome único por usuário
-- Nota: TypeORM não cria este índice automaticamente, mas é necessário conforme requisito
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_name_owner_unique 
ON "Collections"("name", "ownerId") 
WHERE "isActive" = true;

-- Comentários na tabela Collections
COMMENT ON TABLE "Collections" IS 'Tabela de coleções de fontes de dados';
COMMENT ON COLUMN "Collections"."id" IS 'Identificador único da coleção (UUID)';
COMMENT ON COLUMN "Collections"."name" IS 'Nome da coleção (único por usuário)';
COMMENT ON COLUMN "Collections"."description" IS 'Descrição da coleção';
COMMENT ON COLUMN "Collections"."ownerId" IS 'ID do usuário proprietário da coleção';
COMMENT ON COLUMN "Collections"."isActive" IS 'Indica se a coleção está ativa (soft delete)';
COMMENT ON COLUMN "Collections"."createdAt" IS 'Data de criação da coleção';
COMMENT ON COLUMN "Collections"."updatedAt" IS 'Data da última atualização da coleção';

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collections_updated_at
    BEFORE UPDATE ON "Collections"
    FOR EACH ROW
    EXECUTE FUNCTION update_collections_updated_at();

-- =====================================================
-- 4. TABELA: CollectionAccesses
-- =====================================================
CREATE TABLE IF NOT EXISTS "CollectionAccesses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "collectionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "permission" access_permission NOT NULL,
    "grantedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" UUID NOT NULL,
    CONSTRAINT fk_collection_accesses_collection FOREIGN KEY ("collectionId") REFERENCES "Collections"("id") ON DELETE CASCADE,
    CONSTRAINT fk_collection_accesses_user FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE,
    CONSTRAINT fk_collection_accesses_granted_by FOREIGN KEY ("grantedBy") REFERENCES "Users"("id") ON DELETE RESTRICT
);

-- Índices para CollectionAccesses
CREATE INDEX IF NOT EXISTS idx_collection_accesses_collectionId ON "CollectionAccesses"("collectionId");
CREATE INDEX IF NOT EXISTS idx_collection_accesses_userId ON "CollectionAccesses"("userId");
CREATE INDEX IF NOT EXISTS idx_collection_accesses_grantedBy ON "CollectionAccesses"("grantedBy");

-- Índice único composto para evitar duplicatas de acesso
CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_accesses_unique 
ON "CollectionAccesses"("collectionId", "userId");

-- Comentários na tabela CollectionAccesses
COMMENT ON TABLE "CollectionAccesses" IS 'Tabela de permissões de acesso às coleções';
COMMENT ON COLUMN "CollectionAccesses"."id" IS 'Identificador único do acesso (UUID)';
COMMENT ON COLUMN "CollectionAccesses"."collectionId" IS 'ID da coleção';
COMMENT ON COLUMN "CollectionAccesses"."userId" IS 'ID do usuário com acesso';
COMMENT ON COLUMN "CollectionAccesses"."permission" IS 'Nível de permissão (Read, Write, Admin)';
COMMENT ON COLUMN "CollectionAccesses"."grantedAt" IS 'Data em que o acesso foi concedido';
COMMENT ON COLUMN "CollectionAccesses"."grantedBy" IS 'ID do usuário que concedeu o acesso';

-- =====================================================
-- RESUMO DAS ROTAS API IMPLEMENTADAS
-- =====================================================
-- 
-- Autenticação (/api/auth):
--   POST   /api/auth/login          - Login (usuário/senha)
--   GET    /api/auth/me             - Informações do usuário logado
--   POST   /api/auth/logout         - Logout
--
-- Usuários (/api/users):
--   GET    /api/users               - Listar usuários (requer auth)
--   GET    /api/users/:id           - Obter usuário por ID (requer auth)
--   POST   /api/users               - Criar usuário (sem auth - registro)
--   PUT    /api/users/:id           - Atualizar usuário (requer auth)
--   DELETE /api/users/:id           - Excluir usuário (requer auth)
--
-- Coleções (/api/collections):
--   GET    /api/collections         - Listar coleções do usuário (requer auth)
--   GET    /api/collections/:id     - Obter coleção por ID (requer auth)
--   POST   /api/collections         - Criar coleção (requer auth)
--   PUT    /api/collections/:id     - Atualizar coleção (requer auth)
--   DELETE /api/collections/:id     - Excluir coleção (requer auth)
--
-- =====================================================

