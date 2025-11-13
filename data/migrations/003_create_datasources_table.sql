-- =====================================================
-- Migration 003: Criar tabela DataSources
-- RF01.2 - Associar/Desassociar Fontes de Dados
-- =====================================================

-- Criar enum para tipo de fonte de dados
CREATE TYPE data_source_type AS ENUM ('PostgreSQL', 'MongoDB');

-- =====================================================
-- TABELA: DataSources
-- =====================================================
CREATE TABLE IF NOT EXISTS "DataSources" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "collectionId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" data_source_type NOT NULL DEFAULT 'PostgreSQL',
    "connectionUriEncrypted" TEXT NULL,
    "metadata" JSONB NULL,
    "lastScannedAt" TIMESTAMP NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_datasources_collection FOREIGN KEY ("collectionId") REFERENCES "Collections"("id") ON DELETE CASCADE
);

-- Índices para DataSources
CREATE INDEX IF NOT EXISTS idx_datasources_collectionId ON "DataSources"("collectionId");
CREATE INDEX IF NOT EXISTS idx_datasources_isActive ON "DataSources"("isActive");
CREATE INDEX IF NOT EXISTS idx_datasources_type ON "DataSources"("type");
CREATE INDEX IF NOT EXISTS idx_datasources_name ON "DataSources"("name");

-- Índice único composto para garantir nome único por coleção
CREATE UNIQUE INDEX IF NOT EXISTS idx_datasources_name_collection_unique 
ON "DataSources"("name", "collectionId") 
WHERE "isActive" = true;

-- Comentários na tabela DataSources
COMMENT ON TABLE "DataSources" IS 'Tabela de fontes de dados associadas às coleções';
COMMENT ON COLUMN "DataSources"."id" IS 'Identificador único da fonte de dados (UUID)';
COMMENT ON COLUMN "DataSources"."collectionId" IS 'ID da coleção à qual a fonte pertence';
COMMENT ON COLUMN "DataSources"."name" IS 'Nome da fonte de dados (único por coleção)';
COMMENT ON COLUMN "DataSources"."type" IS 'Tipo da fonte de dados (PostgreSQL ou MongoDB)';
COMMENT ON COLUMN "DataSources"."connectionUriEncrypted" IS 'URI de conexão criptografada';
COMMENT ON COLUMN "DataSources"."metadata" IS 'Metadados adicionais em formato JSON';
COMMENT ON COLUMN "DataSources"."lastScannedAt" IS 'Data da última varredura de schema';
COMMENT ON COLUMN "DataSources"."isActive" IS 'Indica se a fonte de dados está ativa (soft delete)';
COMMENT ON COLUMN "DataSources"."createdAt" IS 'Data de criação da fonte de dados';
COMMENT ON COLUMN "DataSources"."updatedAt" IS 'Data da última atualização da fonte de dados';

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_datasources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_datasources_updated_at
    BEFORE UPDATE ON "DataSources"
    FOR EACH ROW
    EXECUTE FUNCTION update_datasources_updated_at();

