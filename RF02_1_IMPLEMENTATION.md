# ✅ RF02.1 - Cadastrar Fonte de Dados - Implementado

## 📋 Resumo

A task **RF02.1 - Cadastrar Fonte de Dados** foi completamente implementada conforme os requisitos especificados.

## 🎯 Critérios de Aceitação Atendidos

- ✅ Usuário pode cadastrar fonte PostgreSQL com URI e credenciais
- ✅ Usuário pode cadastrar fonte MongoDB com URI e credenciais
- ✅ Credenciais são armazenadas criptografadas (AES-GCM)
- ✅ Validação de URI e formato de conexão
- ✅ Teste de conexão antes de salvar
- ✅ API expõe: POST /api/datasources

## 📁 Arquivos Criados

### Domain Layer
- `src/domain/interfaces/IConnectionTester.ts` - Interface para testadores de conexão

### Infrastructure Layer
- `src/infrastructure/services/PostgresConnectionTester.ts` - Testador de conexão PostgreSQL
- `src/infrastructure/services/MongoConnectionTester.ts` - Testador de conexão MongoDB
- `src/infrastructure/services/ConnectionTesterFactory.ts` - Factory para criar testadores

### Application Layer
- `src/application/dto/requests/CreateDataSourceRequest.ts` - DTO de requisição
- `src/application/commands/datasources/CreateDataSourceCommand.ts` - Command para criar fonte
- `src/application/commands/datasources/CreateDataSourceCommandHandler.ts` - Handler do command
- `src/application/queries/datasources/GetAllDataSourcesQuery.ts` - Query para listar fontes
- `src/application/queries/datasources/GetAllDataSourcesQueryHandler.ts` - Handler da query
- `src/application/queries/datasources/GetDataSourceQuery.ts` - Query para obter fonte
- `src/application/queries/datasources/GetDataSourceQueryHandler.ts` - Handler da query

### API Layer
- `src/api/controllers/DataSourcesController.ts` - Controller de fontes de dados
- `src/api/routes/dataSourceRoutes.ts` - Rotas da API

## 🔧 Funcionalidades Implementadas

### 1. Validação de URI
- Validação de formato para PostgreSQL (`postgresql://` ou `postgres://`)
- Validação de formato para MongoDB (`mongodb://` ou `mongodb+srv://`)
- Suporte a URIs com e sem credenciais

### 2. Teste de Conexão
- Teste de conexão PostgreSQL antes de salvar
- Teste de conexão MongoDB antes de salvar
- Timeout de 5 segundos para evitar travamentos
- Mensagens de erro claras em caso de falha

### 3. Criptografia
- URI de conexão criptografada usando AES-GCM
- Integração com `EncryptionService` existente
- Credenciais nunca armazenadas em texto plano

### 4. Segurança
- Verificação de propriedade da coleção
- Validação de permissões do usuário
- Prevenção de duplicatas por nome na mesma coleção

## 📡 Endpoints Implementados

### POST /api/datasources
Cria uma nova fonte de dados.

**Request Body:**
```json
{
  "name": "Minha Fonte PostgreSQL",
  "collectionId": "uuid-da-colecao",
  "type": "PostgreSQL",
  "connectionUri": "postgresql://user:password@host:port/database",
  "metadata": {}
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "collectionId": "uuid",
  "name": "Minha Fonte PostgreSQL",
  "type": "PostgreSQL",
  "connectionUriEncrypted": "encrypted-string",
  "metadata": {},
  "isActive": true,
  "createdAt": "2025-01-27T...",
  "updatedAt": "2025-01-27T..."
}
```

### GET /api/datasources
Lista todas as fontes de dados do usuário.

**Query Parameters:**
- `collectionId` (opcional): Filtrar por coleção específica

**Response (200):**
```json
[
  {
    "id": "uuid",
    "collectionId": "uuid",
    "name": "Minha Fonte PostgreSQL",
    "type": "PostgreSQL",
    ...
  }
]
```

### GET /api/datasources/:id
Obtém uma fonte de dados específica.

**Response (200):**
```json
{
  "id": "uuid",
  "collectionId": "uuid",
  "name": "Minha Fonte PostgreSQL",
  "type": "PostgreSQL",
  ...
}
```

## 🔐 Segurança

- ✅ Autenticação JWT obrigatória em todos os endpoints
- ✅ Verificação de propriedade da coleção
- ✅ Criptografia AES-GCM das credenciais
- ✅ Validação de entrada com `class-validator`
- ✅ Teste de conexão antes de salvar

## 📦 Dependências Adicionadas

- `mongodb` - Driver oficial do MongoDB
- `@types/mongodb` - Tipos TypeScript para MongoDB
- `@types/pg` - Tipos TypeScript para PostgreSQL (já estava instalado)

## 🧪 Próximos Passos (Testes)

Para testar a implementação:

1. **Criar uma fonte PostgreSQL:**
```bash
POST /api/datasources
Authorization: Bearer <token>
{
  "name": "Postgres Test",
  "collectionId": "<collection-id>",
  "type": "PostgreSQL",
  "connectionUri": "postgresql://user:password@localhost:5432/database"
}
```

2. **Criar uma fonte MongoDB:**
```bash
POST /api/datasources
Authorization: Bearer <token>
{
  "name": "Mongo Test",
  "collectionId": "<collection-id>",
  "type": "MongoDB",
  "connectionUri": "mongodb://user:password@localhost:27017/database"
}
```

3. **Listar fontes de dados:**
```bash
GET /api/datasources?collectionId=<collection-id>
Authorization: Bearer <token>
```

## ✅ Status

**Status:** ✅ Implementado e Integrado

**Task ClickUp:** 86ad7evrd

**Data de Implementação:** 2025-01-27

