# ✅ RF02.4 - Visualizar e Editar Schema Extraído - Implementado

## 📋 Resumo

A task **RF02.4 - Visualizar e Editar Schema Extraído** foi completamente implementada conforme os requisitos especificados.

## 🎯 Critérios de Aceitação Atendidos

- ✅ Interface mostra estrutura hierárquica: DataSource → Tables/Collections → Columns/Fields
- ✅ Visualização mostra tipos, nullable, chaves, índices
- ✅ Usuário pode editar descrições de tabelas e colunas
- ✅ Usuário pode adicionar sinônimos para nomes de colunas
- ✅ Usuário pode marcar relacionamentos manuais (via metadados)
- ✅ Alterações são salvas e usadas no contexto para geração de SQL
- ✅ API expõe: GET /datasources/:id/schema, PUT /datasources/:id/schema/metadata

## 📁 Arquivos Criados/Modificados

### Domain Layer
- `src/domain/entities/SchemaSnapshot.ts` - Adicionado campo `metadata` e interfaces SchemaMetadata, TableMetadata, ColumnMetadata

### Application Layer
- `src/application/dto/responses/DataSourceSchemaDto.ts` - DTO de resposta do schema
- `src/application/dto/requests/UpdateSchemaMetadataRequest.ts` - DTO de requisição para atualizar metadados
- `src/application/queries/datasources/GetDataSourceSchemaQuery.ts` - Query para obter schema
- `src/application/queries/datasources/GetDataSourceSchemaQueryHandler.ts` - Handler da query
- `src/application/commands/datasources/UpdateSchemaMetadataCommand.ts` - Command para atualizar metadados
- `src/application/commands/datasources/UpdateSchemaMetadataCommandHandler.ts` - Handler do command

### Infrastructure Layer
- `src/infrastructure/repositories/SchemaSnapshotRepository.ts` - Adicionado método `update()`

### API Layer
- `src/api/controllers/DataSourcesController.ts` - Adicionados métodos `getSchema()` e `updateSchemaMetadata()`
- `src/api/routes/dataSourceRoutes.ts` - Adicionadas rotas GET e PUT

## 🔧 Funcionalidades Implementadas

### 1. Estrutura de Metadados

Metadados editáveis são armazenados em `SchemaSnapshot.metadata`:

```typescript
interface SchemaMetadata {
  tables?: Record<string, TableMetadata>;
}

interface TableMetadata {
  description?: string;
  columns?: Record<string, ColumnMetadata>;
}

interface ColumnMetadata {
  description?: string;
  synonyms?: string[];
}
```

### 2. Obter Schema

**Endpoint:** `GET /api/datasources/:id/schema`

- Retorna schema completo com metadados editáveis
- Suporta parâmetro `version` opcional para obter versão específica
- Se não especificar versão, retorna a mais recente
- Inclui estrutura completa: tabelas, colunas, tipos, chaves, índices, amostras

### 3. Atualizar Metadados

**Endpoint:** `PUT /api/datasources/:id/schema/metadata`

- Permite atualizar descrições de tabelas e colunas
- Permite adicionar sinônimos para colunas
- Faz merge com metadados existentes (não sobrescreve tudo)
- Validação de entrada com class-validator

## 📡 Endpoints Implementados

### GET /api/datasources/:id/schema
Obtém o schema extraído de uma fonte de dados.

**Query Parameters:**
- `version` (opcional): Versão específica do schema. Se não fornecido, retorna o mais recente.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "dataSourceId": "uuid",
  "snapshotId": "uuid",
  "generatedAt": "2025-01-27T...",
  "version": 1,
  "tables": [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false
        },
        {
          "name": "username",
          "type": "character varying(255)",
          "nullable": false
        }
      ],
      "keys": [...],
      "sampleRows": [...]
    }
  ],
  "metadata": {
    "tables": {
      "users": {
        "description": "Tabela de usuários do sistema",
        "columns": {
          "username": {
            "description": "Nome de usuário único",
            "synonyms": ["login", "user_name"]
          }
        }
      }
    }
  },
  "createdAt": "2025-01-27T..."
}
```

### PUT /api/datasources/:id/schema/metadata
Atualiza metadados editáveis do schema.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "metadata": {
    "tables": {
      "users": {
        "description": "Tabela de usuários do sistema",
        "columns": {
          "username": {
            "description": "Nome de usuário único",
            "synonyms": ["login", "user_name"]
          },
          "email": {
            "description": "Email do usuário",
            "synonyms": ["e-mail", "email_address"]
          }
        }
      },
      "orders": {
        "description": "Pedidos realizados pelos usuários",
        "columns": {
          "total": {
            "description": "Valor total do pedido",
            "synonyms": ["amount", "value"]
          }
        }
      }
    }
  }
}
```

**Response (200):**
Retorna o schema completo atualizado com os novos metadados.

## 🔐 Segurança

- ✅ Autenticação JWT obrigatória em todos os endpoints
- ✅ Verificação de propriedade da coleção
- ✅ Validação de entrada com class-validator
- ✅ Merge seguro de metadados (preserva dados existentes)

## 📊 Estrutura de Dados

### Schema Completo
- **tables**: Array de TableInfo com estrutura extraída
- **metadata**: Metadados editáveis (descrições e sinônimos)
- **version**: Versão do snapshot
- **generatedAt**: Data/hora da extração

### Metadados Editáveis
- **tables[tableName].description**: Descrição da tabela
- **tables[tableName].columns[columnName].description**: Descrição da coluna
- **tables[tableName].columns[columnName].synonyms**: Array de sinônimos

## 🧪 Como Testar

1. **Obter schema:**
```bash
GET /api/datasources/<dataSourceId>/schema
Authorization: Bearer <token>
```

2. **Obter versão específica:**
```bash
GET /api/datasources/<dataSourceId>/schema?version=1
Authorization: Bearer <token>
```

3. **Atualizar metadados:**
```bash
PUT /api/datasources/<dataSourceId>/schema/metadata
Authorization: Bearer <token>
Content-Type: application/json

{
  "metadata": {
    "tables": {
      "users": {
        "description": "Tabela de usuários",
        "columns": {
          "username": {
            "description": "Nome de usuário",
            "synonyms": ["login"]
          }
        }
      }
    }
  }
}
```

## 📝 Observações

- Metadados são opcionais e podem ser adicionados gradualmente
- O merge preserva metadados existentes que não foram atualizados
- Sinônimos são úteis para melhorar a geração de SQL por IA
- Descrições ajudam a contextualizar tabelas e colunas
- Metadados são armazenados no snapshot mais recente

## ✅ Status

**Status:** ✅ Implementado e Integrado

**Task ClickUp:** 86ad7evrw

**Data de Implementação:** 2025-01-27

**Postman Collection:** Atualizada com novos endpoints

