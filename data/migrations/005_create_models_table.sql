-- Migration 005: Criar tabela Models
-- RF04.1 - Armazena modelos de IA disponíveis no sistema

-- Criar enum para origem do modelo
CREATE TYPE model_origin AS ENUM ('OpenRouter', 'Internal');

-- Criar tabela Models
CREATE TABLE IF NOT EXISTS "Models" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    identifier VARCHAR(500) NOT NULL UNIQUE,
    description TEXT,
    origin model_origin NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX idx_models_origin ON "Models"(origin);
CREATE INDEX idx_models_identifier ON "Models"(identifier);
CREATE INDEX idx_models_is_active ON "Models"("isActive");

-- Criar trigger para atualizar updatedAt
CREATE OR REPLACE FUNCTION update_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_models_updated_at
    BEFORE UPDATE ON "Models"
    FOR EACH ROW
    EXECUTE FUNCTION update_models_updated_at();

-- Inserir modelos populares do OpenRouter como exemplo
INSERT INTO "Models" (id, name, identifier, description, origin) VALUES
    (gen_random_uuid(), 'GPT-4', 'openai/gpt-4', 'OpenAI''s most capable model, great for tasks requiring deep understanding and complex reasoning.', 'OpenRouter'),
    (gen_random_uuid(), 'GPT-4 Turbo', 'openai/gpt-4-turbo', 'More efficient and faster version of GPT-4 with 128K context window.', 'OpenRouter'),
    (gen_random_uuid(), 'GPT-3.5 Turbo', 'openai/gpt-3.5-turbo', 'Fast and cost-effective model for most conversational tasks.', 'OpenRouter'),
    (gen_random_uuid(), 'Claude 3 Opus', 'anthropic/claude-3-opus', 'Anthropic''s most powerful model with superior performance on complex tasks.', 'OpenRouter'),
    (gen_random_uuid(), 'Claude 3 Sonnet', 'anthropic/claude-3-sonnet', 'Balanced model offering intelligence and speed.', 'OpenRouter'),
    (gen_random_uuid(), 'Claude 3 Haiku', 'anthropic/claude-3-haiku', 'Anthropic''s fastest model, optimized for near-instant responsiveness.', 'OpenRouter'),
    (gen_random_uuid(), 'Gemini Pro', 'google/gemini-pro', 'Google''s most capable multimodal model.', 'OpenRouter'),
    (gen_random_uuid(), 'Llama 3 70B', 'meta-llama/llama-3-70b-instruct', 'Meta''s open-source large language model with 70B parameters.', 'OpenRouter'),
    (gen_random_uuid(), 'Mixtral 8x7B', 'mistralai/mixtral-8x7b-instruct', 'Mistral AI''s mixture-of-experts model with excellent performance.', 'OpenRouter'),
    (gen_random_uuid(), 'Command R+', 'cohere/command-r-plus', 'Cohere''s advanced model optimized for RAG and tool use.', 'OpenRouter')
ON CONFLICT (identifier) DO NOTHING;

-- Comentários
COMMENT ON TABLE "Models" IS 'Armazena modelos de IA disponíveis no sistema (OpenRouter e Internos)';
COMMENT ON COLUMN "Models".identifier IS 'Identificador único do modelo (ex: openai/gpt-4, internal/custom-model)';
COMMENT ON COLUMN "Models".origin IS 'Origem do modelo: OpenRouter (externo) ou Internal (privado)';
COMMENT ON COLUMN "Models"."isActive" IS 'Indica se o modelo está ativo e disponível para uso';
