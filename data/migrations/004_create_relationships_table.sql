-- Migration 004: Criar tabela Relationships
-- RF03.2 - Armazena relacionamentos descobertos entre fontes de dados

-- Criar função para atualizar updatedAt (se não existir)
CREATE OR REPLACE FUNCTION update_relationships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar tabela Relationships
CREATE TABLE IF NOT EXISTS "Relationships" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "collectionId" UUID NOT NULL,
    "sourceTable" VARCHAR(255) NOT NULL,
    "sourceColumn" VARCHAR(255) NOT NULL,
    "targetTable" VARCHAR(255) NOT NULL,
    "targetColumn" VARCHAR(255) NOT NULL,
    confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    "manualOverride" BOOLEAN NOT NULL DEFAULT FALSE,
    "sourceDataSourceId" TEXT,
    "targetDataSourceId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_relationships_collection 
        FOREIGN KEY ("collectionId") 
        REFERENCES "Collections"(id) 
        ON DELETE CASCADE
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_relationships_collection_id ON "Relationships"("collectionId");
CREATE INDEX IF NOT EXISTS idx_relationships_source ON "Relationships"("sourceTable", "sourceColumn");
CREATE INDEX IF NOT EXISTS idx_relationships_target ON "Relationships"("targetTable", "targetColumn");
CREATE INDEX IF NOT EXISTS idx_relationships_confidence ON "Relationships"(confidence DESC);

-- Criar trigger para atualizar updatedAt automaticamente
DROP TRIGGER IF EXISTS update_relationships_updated_at ON "Relationships";
CREATE TRIGGER update_relationships_updated_at
    BEFORE UPDATE ON "Relationships"
    FOR EACH ROW
    EXECUTE FUNCTION update_relationships_updated_at();

-- Comentários na tabela Relationships
COMMENT ON TABLE "Relationships" IS 'Tabela de relacionamentos descobertos entre tabelas de fontes distintas';
COMMENT ON COLUMN "Relationships".id IS 'Identificador único do relacionamento (UUID)';
COMMENT ON COLUMN "Relationships"."collectionId" IS 'ID da coleção à qual o relacionamento pertence';
COMMENT ON COLUMN "Relationships"."sourceTable" IS 'Nome da tabela de origem';
COMMENT ON COLUMN "Relationships"."sourceColumn" IS 'Nome da coluna de origem';
COMMENT ON COLUMN "Relationships"."targetTable" IS 'Nome da tabela de destino';
COMMENT ON COLUMN "Relationships"."targetColumn" IS 'Nome da coluna de destino';
COMMENT ON COLUMN "Relationships".confidence IS 'Score de confiança do relacionamento (0.00 a 1.00)';
COMMENT ON COLUMN "Relationships"."manualOverride" IS 'Indica se o relacionamento foi confirmado manualmente';
COMMENT ON COLUMN "Relationships"."sourceDataSourceId" IS 'ID da fonte de dados de origem';
COMMENT ON COLUMN "Relationships"."targetDataSourceId" IS 'ID da fonte de dados de destino';

