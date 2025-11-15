# ✅ RF02.2 - Extração Automática de Schema - Implementado

## 📋 Resumo

A task **RF02.2 - Extração Automática de Schema** foi completamente implementada conforme os requisitos especificados.

## 🎯 Critérios de Aceitação Atendidos

- ✅ Extração automática executa após cadastro bem-sucedido
- ✅ Extrai tabelas/coleções, colunas/campos, tipos de dados
- ✅ Identifica chaves primárias quando disponíveis
- ✅ Identifica chaves estrangeiras quando disponíveis
- ✅ Extrai índices quando disponíveis
- ✅ Armazena amostras de dados (primeiras 10 linhas)
- ✅ Processo assíncrono (não bloqueia cadastro)
- ✅ Atualiza last_scanned_at após conclusão

## 📁 Arquivos Criados

### Domain Layer
- `src/domain/entities/SchemaSnapshot.ts` - Entidade de snapshot de schema
- `src/domain/interfaces/ISchemaExtractor.ts` - Interface para extractors
- `src/domain/interfaces/ISchemaSnapshotRepository.ts` - Interface do repositório

### Infrastructure Layer
- `src/infrastructure/services/extractors/PostgreSQLSchemaExtractor.ts` - Extractor para PostgreSQL
- `src/infrastructure/services/extractors/MongoDBSchemaExtractor.ts` - Extractor para MongoDB
- `src/infrastructure/services/SchemaExtractionService.ts` - Serviço de orquestração
- `src/infrastructure/repositories/SchemaSnapshotRepository.ts` - Repositório de snapshots

### Application Layer
- `src/application/dto/responses/SchemaSnapshotDto.ts` - DTO de resposta
- `src/application/commands/datasources/ExtractSchemaCommand.ts` - Command para extração
- `src/application/commands/datasources/ExtractSchemaCommandHandler.ts` - Handler do command

### API Layer
- Endpoint adicionado em `DataSourcesController.extractSchema()`
- Rota adicionada em `dataSourceRoutes.ts`

## 🔧 Funcionalidades Implementadas

### 1. Entidade SchemaSnapshot
- Armazena schema completo com versionamento
- Estrutura de tabelas/coleções com colunas, chaves e amostras
- Relacionamento com DataSource

### 2. PostgreSQL Schema Extractor
- Extrai todas as tabelas do schema público
- Extrai colunas com tipos de dados completos
- Identifica chaves primárias
- Identifica chaves estrangeiras com referências
- Identifica constraints UNIQUE
- Extrai índices
- Amostras das primeiras 10 linhas de cada tabela

### 3. MongoDB Schema Extractor
- Extrai todas as coleções (exceto system.*)
- Infere schema a partir de documentos de amostra
- Identifica tipos de dados (incluindo tipos mistos)
- Identifica índices (incluindo _id como primary key)
- Amostras dos primeiros 10 documentos de cada coleção

### 4. Extração Automática
- Executada automaticamente após cadastro bem-sucedido
- Processo assíncrono (não bloqueia resposta)
- Erros são logados mas não falham o cadastro
- Atualiza `lastScannedAt` automaticamente

### 5. Extração Manual
- Endpoint dedicado para extração manual
- Permite re-extrair schema quando necessário
- Versionamento automático (incrementa versão)

## 📡 Endpoints Implementados

### POST /api/datasources/:id/extract-schema
Extrai schema e metadados de uma fonte de dados.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "dataSourceId": "uuid",
  "generatedAt": "2025-01-27T...",
  "tables": [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "description": "Default: gen_random_uuid()"
        },
        {
          "name": "username",
          "type": "character varying(255)",
          "nullable": false
        }
      ],
      "keys": [
        {
          "type": "primary",
          "name": "users_pkey",
          "columns": ["id"]
        },
        {
          "type": "foreign",
          "name": "fk_collection",
          "columns": ["collection_id"],
          "referencedTable": "collections",
          "referencedColumns": ["id"]
        }
      ],
      "sampleRows": [
        {
          "id": "uuid",
          "username": "example"
        }
      ]
    }
  ],
  "version": 1,
  "createdAt": "2025-01-27T..."
}
```

## 🔐 Segurança

- ✅ Autenticação JWT obrigatória
- ✅ Verificação de propriedade da coleção
- ✅ Descriptografia segura da URI antes de usar
- ✅ Validação de permissões

## 📊 Estrutura de Dados

### TableInfo
```typescript
{
  name: string;
  columns: TableColumn[];
  keys: TableKey[];
  sampleRows: Record<string, any>[];
}
```

### TableColumn
```typescript
{
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}
```

### TableKey
```typescript
{
  type: 'primary' | 'foreign' | 'unique' | 'index';
  name: string;
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
}
```

## 🧪 Como Testar

1. **Criar uma fonte de dados:**
```bash
POST /api/datasources
{
  "name": "Postgres Test",
  "collectionId": "<collection-id>",
  "type": "PostgreSQL",
  "connectionUri": "postgresql://user:password@localhost:5432/database"
}
```

2. **Aguardar extração automática** (executa em background)

3. **Ou extrair manualmente:**
```bash
POST /api/datasources/<dataSourceId>/extract-schema
Authorization: Bearer <token>
```

4. **Verificar lastScannedAt:**
```bash
GET /api/datasources/<dataSourceId>
```

## 📝 Observações

- A extração automática é assíncrona e não bloqueia o cadastro
- Erros na extração automática são logados mas não falham o cadastro
- Cada extração cria um novo snapshot com versão incrementada
- Snapshots anteriores são mantidos para histórico
- Para MongoDB, o schema é inferido a partir de amostras (pode variar)

## ✅ Status

**Status:** ✅ Implementado e Integrado

**Task ClickUp:** 86ad7evrk

**Data de Implementação:** 2025-01-27

**Postman Collection:** Atualizada com novos endpoints

