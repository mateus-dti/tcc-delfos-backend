-- =====================================================
-- Migration: Adicionar campo role na tabela Users
-- =====================================================

-- Criar enum user_role
CREATE TYPE user_role AS ENUM ('default', 'manager', 'admin');

-- Adicionar coluna role na tabela Users
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "role" user_role NOT NULL DEFAULT 'default';

-- Criar índice para role (opcional, mas útil para consultas por role)
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users"("role");

-- Comentário na coluna
COMMENT ON COLUMN "Users"."role" IS 'Role do usuário: default, manager ou admin';

-- Atualizar usuários existentes para ter role 'default' (se necessário)
-- UPDATE "Users" SET "role" = 'default' WHERE "role" IS NULL;

