# Definições do Projeto Backend - Delfos

**Data de Criação:** 2025-01-27  
**Versão:** 1.0  
**Baseado em:** Documento de Requisitos de Software (DRS)

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Modelagem de Dados](#3-modelagem-de-dados)
4. [APIs e Endpoints](#4-apis-e-endpoints)
5. [Tecnologias e Bibliotecas](#5-tecnologias-e-bibliotecas)
6. [Estrutura de Projetos](#6-estrutura-de-projetos)
7. [Plano de Implementação por Funcionalidades](#7-plano-de-implementação-por-funcionalidades)
8. [Decisões Técnicas Aprovadas](#8-decisões-técnicas-aprovadas)
9. [Ambiente e Deploy](#9-ambiente-e-deploy)
10. [Próximos Passos](#10-próximos-passos)
11. [Referências](#11-referências)

---

## 1. Visão Geral

### 1.1 Objetivo

Desenvolver uma API REST em .NET que permita:
- Gerenciar coleções de fontes de dados heterogêneas
- Extrair e manter schemas de múltiplos bancos (PostgreSQL, MongoDB)
- Descobrir e mapear relacionamentos entre fontes
- Integrar com modelos de IA (OpenRouter e modelos privados)
- Traduzir linguagem natural em consultas Trino SQL
- Executar consultas federadas via Trino
- Manter histórico e auditoria de consultas

### 1.2 Escopo do MVP

**Incluído:**
- ✅ CRUD de Coleções e Fontes de Dados
- ✅ Extração automática de schema (PostgreSQL e MongoDB)
- ✅ Descoberta heurística de relacionamentos
- ✅ Integração com OpenRouter
- ✅ Suporte a modelos privados via endpoint configurável
- ✅ Geração de SQL via IA
- ✅ Validação e execução via Trino
- ✅ Histórico de consultas
- ✅ Autenticação básica (usuário/senha)
- ✅ Criptografia de credenciais

**Fora do MVP:**
- ❌ Conectores adicionais (MySQL, SQL Server, Oracle)
- ❌ Editor visual de mapeamentos
- ❌ Caching avançado
- ❌ Autenticação corporativa (OAuth2/SSO)
- ❌ Interface de administração de modelos

---

## 2. Arquitetura

### 2.1 Padrão Arquitetural

**Clean Architecture** com separação em camadas:

```
┌─────────────────────────────────────┐
│      Delfos.Api (Presentation)     │  ← Controllers, Middleware, Config
├─────────────────────────────────────┤
│   Delfos.Application (Use Cases)   │  ← Commands, Queries, Services, DTOs
├─────────────────────────────────────┤
│      Delfos.Domain (Core)           │  ← Entities, Interfaces, ValueObjects
├─────────────────────────────────────┤
│  Delfos.Infrastructure (External)  │  ← EF Core, Repositories, External APIs
└─────────────────────────────────────┘
```

### 2.2 Princípios

- **CQRS**: Separação de Commands (escrita) e Queries (leitura)
- **Repository Pattern**: Abstração de acesso a dados
- **Dependency Injection**: Inversão de dependências
- **Domain-Driven Design**: Entidades ricas com lógica de negócio

### 2.3 Fluxo de Dados

```
Frontend → API Controller → Command/Query Handler → Domain Service → Repository → Database
                                                      ↓
                                              External Service (Trino/OpenRouter)
```

---

## 3. Modelagem de Dados

### 3.1 Entidades Principais

#### 3.1.1 Collection (Coleção)
```csharp
- Id: Guid (PK)
- Name: string (required, unique)
- Description: string?
- OwnerId: Guid (FK → User)
- CreatedAt: DateTime
- UpdatedAt: DateTime
- IsActive: bool
```

#### 3.1.2 DataSource (Fonte de Dados)
```csharp
- Id: Guid (PK)
- CollectionId: Guid (FK → Collection)
- Name: string (required)
- Type: DataSourceType (PostgreSQL, MongoDB)
- ConnectionUriEncrypted: string (encrypted)
- Metadata: jsonb (PostgreSQL) / BSON (MongoDB)
- LastScannedAt: DateTime?
- IsActive: bool
- CreatedAt: DateTime
- UpdatedAt: DateTime
```

#### 3.1.3 SchemaSnapshot (Snapshot de Schema)
```csharp
- Id: Guid (PK)
- DataSourceId: Guid (FK → DataSource)
- GeneratedAt: DateTime
- Tables: jsonb (PostgreSQL) / BSON (MongoDB)
  - Array de: { Name, Columns[], Keys, SampleRows[] }
- Version: int (versionamento de snapshots)
```

#### 3.1.4 Relationship (Relacionamento)
```csharp
- Id: Guid (PK)
- CollectionId: Guid (FK → Collection)
- SourceTable: string
- SourceColumn: string
- TargetTable: string
- TargetColumn: string
- Confidence: decimal (0-1)
- ManualOverride: bool
- IsActive: bool
- CreatedAt: DateTime
- UpdatedAt: DateTime
```

#### 3.1.5 ModelConfig (Configuração de Modelo IA)
```csharp
- Id: Guid (PK)
- Name: string (required)
- Provider: ModelProvider (OpenRouter, Private)
- Endpoint: string?
- ApiKeyEncrypted: string? (encrypted)
- Defaults: jsonb (configurações padrão)
- IsActive: bool
- CreatedAt: DateTime
- UpdatedAt: DateTime
```

#### 3.1.6 QueryHistory (Histórico de Consultas)
```csharp
- Id: Guid (PK)
- UserId: Guid (FK → User)
- CollectionId: Guid (FK → Collection)
- ModelConfigId: Guid (FK → ModelConfig)
- Prompt: string (pergunta em linguagem natural)
- GeneratedSql: string (SQL gerado pelo modelo)
- FinalSql: string? (SQL após edição manual)
- Status: QueryStatus (Pending, Executing, Success, Failed, Cancelled)
- ExecutionTimeMs: int?
- ResultMetadata: jsonb (linhas retornadas, bytes lidos, etc.)
- ErrorMessage: string?
- CreatedAt: DateTime
- ExecutedAt: DateTime?
```

#### 3.1.7 User (Usuário)
```csharp
- Id: Guid (PK)
- Username: string (required, unique)
- Email: string (required, unique)
- PasswordHash: string (hashed)
- IsActive: bool
- CreatedAt: DateTime
- LastLoginAt: DateTime?
```

#### 3.1.8 CollectionAccess (Acesso a Coleção)
```csharp
- Id: Guid (PK)
- CollectionId: Guid (FK → Collection)
- UserId: Guid (FK → User)
- Permission: AccessPermission (Read, Write, Admin)
- GrantedAt: DateTime
- GrantedBy: Guid (FK → User)
```

### 3.2 Enums

```csharp
public enum DataSourceType
{
    PostgreSQL = 1,
    MongoDB = 2
}

public enum ModelProvider
{
    OpenRouter = 1,
    Private = 2
}

public enum QueryStatus
{
    Pending = 1,
    Executing = 2,
    Success = 3,
    Failed = 4,
    Cancelled = 5
}

public enum AccessPermission
{
    Read = 1,
    Write = 2,
    Admin = 3
}
```

### 3.3 Banco de Dados

**Tecnologia:** PostgreSQL 16 (via Docker)  
**ORM:** Entity Framework Core 8.0  
**Migrations:** Code-First Migrations

---

## 4. APIs e Endpoints

### 4.1 Autenticação

```
POST   /api/auth/login          - Login (usuário/senha)
POST   /api/auth/logout         - Logout
POST   /api/auth/refresh        - Refresh token (futuro)
GET    /api/auth/me             - Informações do usuário logado
```

### 4.2 Coleções (RF01)

```
GET    /api/collections                    - Listar coleções (com filtros)
GET    /api/collections/{id}               - Obter coleção por ID
POST   /api/collections                    - Criar coleção
PUT    /api/collections/{id}                - Atualizar coleção
DELETE /api/collections/{id}                - Excluir coleção (soft delete)
GET    /api/collections/{id}/data-sources   - Listar fontes da coleção
POST   /api/collections/{id}/data-sources   - Associar fonte à coleção
DELETE /api/collections/{id}/data-sources/{dataSourceId} - Desassociar fonte
GET    /api/collections/{id}/relationships  - Listar relacionamentos
GET    /api/collections/{id}/access         - Listar acessos/permissões
POST   /api/collections/{id}/access         - Conceder acesso
DELETE /api/collections/{id}/access/{userId} - Revogar acesso
```

### 4.3 Fontes de Dados (RF02)

```
GET    /api/data-sources                    - Listar fontes
GET    /api/data-sources/{id}               - Obter fonte por ID
POST   /api/data-sources                    - Cadastrar fonte
PUT    /api/data-sources/{id}                - Atualizar fonte
DELETE /api/data-sources/{id}                - Excluir fonte
POST   /api/data-sources/{id}/extract-schema - Extrair schema (manual)
GET    /api/data-sources/{id}/schema        - Obter schema atual
GET    /api/data-sources/{id}/schema/history - Histórico de schemas
```

### 4.4 Relacionamentos (RF03)

```
GET    /api/relationships                   - Listar relacionamentos
GET    /api/relationships/{id}              - Obter relacionamento por ID
POST   /api/relationships                   - Criar relacionamento manual
PUT    /api/relationships/{id}              - Atualizar relacionamento
DELETE /api/relationships/{id}              - Excluir relacionamento
POST   /api/collections/{id}/discover-relationships - Descobrir relacionamentos (heurística)
```

### 4.5 Modelos IA (RF04)

```
GET    /api/models                          - Listar modelos configurados
GET    /api/models/{id}                     - Obter modelo por ID
POST   /api/models                          - Configurar novo modelo
PUT    /api/models/{id}                     - Atualizar modelo
DELETE /api/models/{id}                     - Excluir modelo
GET    /api/models/openrouter/list          - Listar modelos públicos do OpenRouter
POST   /api/models/{id}/test                - Testar conexão com modelo
GET    /api/collections/{id}/model-preference - Obter preferência de modelo da coleção
PUT    /api/collections/{id}/model-preference - Definir preferência de modelo
```

### 4.6 Consultas (RF05, RF06)

```
POST   /api/queries/generate                - Gerar SQL a partir de linguagem natural
POST   /api/queries/validate                - Validar SQL antes de executar
POST   /api/queries/execute                 - Executar query no Trino
GET    /api/queries/{id}                    - Obter status/resultado da query
POST   /api/queries/{id}/cancel             - Cancelar execução
GET    /api/queries/{id}/results            - Obter resultados (paginados)
GET    /api/queries/{id}/export             - Exportar resultados (CSV/JSON)
```

### 4.7 Histórico (RF07)

```
GET    /api/history/queries                 - Listar histórico de consultas
GET    /api/history/queries/{id}            - Obter detalhes de consulta
POST   /api/history/queries/{id}/replay     - Reexecutar consulta
GET    /api/history/stats                   - Estatísticas de uso
```

### 4.8 Usuários (RF08)

```
GET    /api/users                           - Listar usuários (admin)
GET    /api/users/{id}                      - Obter usuário por ID
POST   /api/users                           - Criar usuário
PUT    /api/users/{id}                      - Atualizar usuário
DELETE /api/users/{id}                      - Desativar usuário
```

---

## 5. Tecnologias e Bibliotecas

### 5.1 Core

- **.NET 8.0** - Framework principal
- **ASP.NET Core** - Web API framework
- **Entity Framework Core 8.0** - ORM
- **Npgsql.EntityFrameworkCore.PostgreSQL** - Provider PostgreSQL

### 5.2 Segurança

- **BCrypt.Net-Next** - Hash de senhas
- **System.Security.Cryptography** - Criptografia de credenciais (AES-GCM)
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT (futuro)

### 5.3 Logging e Observabilidade

- **Serilog** - Logging estruturado
- **Serilog.Sinks.Console** - Console sink
- **Serilog.Sinks.File** - File sink
- **Serilog.Sinks.PostgreSQL** - PostgreSQL sink (opcional)

### 5.4 Validação

- **FluentValidation** - Validação de comandos/queries
- **FluentValidation.AspNetCore** - Integração ASP.NET Core

### 5.5 HTTP Client

- **Microsoft.Extensions.Http** - HttpClient factory
- **Polly** - Resilience e retry policies

### 5.6 CQRS e Mediator

- **MediatR** - Mediator pattern para CQRS

### 5.7 Mapeamento

- **AutoMapper** - Mapeamento DTO ↔ Entity

### 5.8 Documentação

- **Swashbuckle.AspNetCore** - Swagger/OpenAPI

### 5.9 Testes

- **xUnit** - Framework de testes
- **Moq** - Mocking
- **FluentAssertions** - Assertions fluentes
- **Microsoft.AspNetCore.Mvc.Testing** - Testes de integração

### 5.10 Trino Integration

- **Trino.Client** (NuGet) ou HTTP REST client customizado

### 5.11 OpenRouter Integration

- HTTP REST client customizado (sem biblioteca específica)

---

## 6. Estrutura de Projetos

### 6.1 Solução .NET

```
Delfos.sln
├── src/
│   ├── Delfos.Api/                    (ASP.NET Core Web API)
│   ├── Delfos.Application/            (Class Library)
│   ├── Delfos.Domain/                  (Class Library)
│   └── Delfos.Infrastructure/         (Class Library)
└── tests/
    ├── Delfos.UnitTests/               (xUnit)
    └── Delfos.IntegrationTests/        (xUnit)
```

### 6.2 Dependências entre Projetos

```
Delfos.Api
  ├── Delfos.Application
  └── Delfos.Infrastructure

Delfos.Application
  └── Delfos.Domain

Delfos.Infrastructure
  └── Delfos.Domain
```

### 6.3 Estrutura Detalhada por Projeto

#### Delfos.Api
```
Delfos.Api/
├── Controllers/
│   ├── AuthController.cs
│   ├── CollectionsController.cs
│   ├── DataSourcesController.cs
│   ├── RelationshipsController.cs
│   ├── ModelsController.cs
│   ├── QueriesController.cs
│   ├── HistoryController.cs
│   └── UsersController.cs
├── Middleware/
│   ├── ErrorHandlingMiddleware.cs
│   ├── RequestLoggingMiddleware.cs
│   └── AuthenticationMiddleware.cs
├── Configurations/
│   ├── SwaggerConfiguration.cs
│   ├── SerilogConfiguration.cs
│   └── DependencyInjectionConfiguration.cs
├── Program.cs
└── appsettings.json
```

#### Delfos.Application
```
Delfos.Application/
├── Commands/
│   ├── Collections/
│   ├── DataSources/
│   ├── Relationships/
│   ├── Models/
│   ├── Queries/
│   └── Users/
├── Queries/
│   ├── Collections/
│   ├── DataSources/
│   ├── Relationships/
│   ├── Models/
│   ├── Queries/
│   └── Users/
├── Services/
│   ├── ISchemaExtractionService.cs
│   ├── SchemaExtractionService.cs
│   ├── IRelationshipDiscoveryService.cs
│   ├── RelationshipDiscoveryService.cs
│   ├── IPromptBuilderService.cs
│   ├── PromptBuilderService.cs
│   ├── IQueryValidationService.cs
│   ├── QueryValidationService.cs
│   ├── ITrinoService.cs
│   └── TrinoService.cs
├── DTOs/
│   ├── Requests/
│   └── Responses/
└── Mappings/
    └── MappingProfile.cs
```

#### Delfos.Domain
```
Delfos.Domain/
├── Entities/
│   ├── Collection.cs
│   ├── DataSource.cs
│   ├── SchemaSnapshot.cs
│   ├── Relationship.cs
│   ├── ModelConfig.cs
│   ├── QueryHistory.cs
│   ├── User.cs
│   └── CollectionAccess.cs
├── Interfaces/
│   ├── IRepository.cs
│   ├── ICollectionRepository.cs
│   ├── IDataSourceRepository.cs
│   ├── ISchemaSnapshotRepository.cs
│   ├── IRelationshipRepository.cs
│   ├── IModelConfigRepository.cs
│   ├── IQueryHistoryRepository.cs
│   └── IUserRepository.cs
├── ValueObjects/
│   ├── ConnectionString.cs
│   ├── EncryptedCredential.cs
│   └── QueryResult.cs
└── Enums/
    ├── DataSourceType.cs
    ├── ModelProvider.cs
    ├── QueryStatus.cs
    └── AccessPermission.cs
```

#### Delfos.Infrastructure
```
Delfos.Infrastructure/
├── Data/
│   ├── DelfosDbContext.cs
│   ├── Configurations/
│   │   ├── CollectionConfiguration.cs
│   │   ├── DataSourceConfiguration.cs
│   │   └── ...
│   └── Migrations/
├── Repositories/
│   ├── CollectionRepository.cs
│   ├── DataSourceRepository.cs
│   ├── SchemaSnapshotRepository.cs
│   ├── RelationshipRepository.cs
│   ├── ModelConfigRepository.cs
│   ├── QueryHistoryRepository.cs
│   └── UserRepository.cs
├── Services/
│   ├── EncryptionService.cs
│   └── PasswordHasherService.cs
└── External/
│   ├── Trino/
│   │   ├── ITrinoClient.cs
│   │   ├── TrinoClient.cs
│   │   └── Models/
│   ├── OpenRouter/
│   │   ├── IOpenRouterClient.cs
│   │   ├── OpenRouterClient.cs
│   │   └── Models/
│   └── SchemaExtractors/
│       ├── ISchemaExtractor.cs
│       ├── PostgresSchemaExtractor.cs
│       └── MongoSchemaExtractor.cs
```

---

## 7. Plano de Implementação por Funcionalidades

O desenvolvimento será realizado **por funcionalidades**, seguindo a ordem dos Requisitos Funcionais (RF) do documento de requisitos. Cada funcionalidade será implementada de ponta a ponta (end-to-end) antes de passar para a próxima.

### Fase 0: Infraestrutura Base (Pré-requisito)

**Objetivos:**
- Configurar estrutura de projetos .NET 8
- Configurar Docker Compose para ambiente local
- Setup do banco de metadados (PostgreSQL)
- Configuração básica de logging (Serilog)
- Swagger/OpenAPI
- Configuração de DI e estrutura base

**Entregas:**
- ✅ Solução .NET 8 com 4 projetos
- ✅ Docker Compose funcional (local)
- ✅ Migrations iniciais do EF Core
- ✅ Swagger configurado
- ✅ Serilog configurado
- ✅ Estrutura base de DI e configurações

**Ordem de Implementação:**
1. Criar solução e projetos
2. Configurar Docker Compose
3. Configurar EF Core e DbContext
4. Configurar Serilog
5. Configurar Swagger
6. Configurar DI básico

---

### RF08: Segurança e Permissões

**Objetivos:**
- Implementar autenticação JWT (usuário/senha)
- CRUD de Usuários
- Sistema de permissões básico por coleção
- Criptografia de credenciais (chave via variável de ambiente)

**Entregas:**
- ✅ Entidade User e CollectionAccess
- ✅ Endpoints de autenticação (login/logout)
- ✅ Endpoints de usuários (CRUD)
- ✅ Middleware de autenticação/autorização
- ✅ Serviço de criptografia (AES-GCM)
- ✅ Hash de senhas (BCrypt)
- ✅ Testes unitários de segurança

**Ordem de Implementação:**
1. Entidades User e CollectionAccess
2. Repositórios de User
3. Serviço de criptografia e hash
4. Commands/Queries de autenticação
5. Controller de autenticação
6. Middleware de autenticação
7. Commands/Queries de usuários
8. Controller de usuários
9. Testes

---

### RF01: Gerenciar Coleções

**Objetivos:**
- CRUD completo de Coleções
- Associação/desassociação de fontes de dados
- Controle de acesso por coleção
- Visualização de detalhes e listagem

**Entregas:**
- ✅ Entidade Collection
- ✅ Endpoints de coleções (CRUD)
- ✅ Endpoints de associação de fontes
- ✅ Endpoints de controle de acesso
- ✅ Validações e regras de negócio
- ✅ Testes unitários e integração

**Ordem de Implementação:**
1. Entidade Collection
2. Repositório de Collection
3. Commands/Queries de coleções
4. Controller de coleções
5. Commands/Queries de acesso
6. Testes

---

### RF02: Conexão e Extração de Schema

**Objetivos:**
- CRUD de Fontes de Dados
- Extração automática de schema PostgreSQL
- Extração automática de schema MongoDB
- Persistência de snapshots com histórico completo
- Endpoint para extração manual
- Visualização de schema e histórico

**Entregas:**
- ✅ Entidades DataSource e SchemaSnapshot
- ✅ SchemaExtractor para PostgreSQL
- ✅ SchemaExtractor para MongoDB
- ✅ Endpoints de fontes de dados (CRUD)
- ✅ Endpoint de extração de schema
- ✅ Persistência de snapshots com versionamento
- ✅ Histórico de schemas
- ✅ Testes de integração com bancos reais

**Ordem de Implementação:**
1. Entidades DataSource e SchemaSnapshot
2. Repositórios
3. Interface ISchemaExtractor
4. PostgresSchemaExtractor
5. MongoSchemaExtractor
6. SchemaExtractionService (orquestração)
7. Commands/Queries de fontes
8. Controller de fontes
9. Endpoint de extração
10. Testes com bancos de teste

---

### RF03: Descoberta e Mapeamento de Relacionamentos

**Objetivos:**
- Heurísticas de descoberta de relacionamentos
- CRUD de relacionamentos
- Endpoint de descoberta automática
- Validação e edição manual de relacionamentos

**Entregas:**
- ✅ Entidade Relationship
- ✅ Serviço de descoberta de relacionamentos
- ✅ Heurísticas (nomes, tipos, amostras)
- ✅ Endpoints de relacionamentos (CRUD)
- ✅ Endpoint de descoberta automática
- ✅ Testes com dados de exemplo

**Ordem de Implementação:**
1. Entidade Relationship
2. Repositório de Relationship
3. RelationshipDiscoveryService (heurísticas)
4. Commands/Queries de relacionamentos
5. Controller de relacionamentos
6. Endpoint de descoberta
7. Testes

---

### RF04: Seleção de Modelo IA

**Objetivos:**
- Integração com OpenRouter (listar modelos públicos)
- Suporte a modelos privados via endpoint configurável
- CRUD de configurações de modelos
- Preferências de modelo por coleção
- Teste de conexão com modelos

**Entregas:**
- ✅ Entidade ModelConfig
- ✅ Cliente OpenRouter (HTTP REST)
- ✅ Cliente para modelos privados
- ✅ Endpoints de modelos (CRUD)
- ✅ Endpoint de listagem OpenRouter
- ✅ Endpoint de teste de modelo
- ✅ Preferências por coleção
- ✅ Testes de integração com modelos

**Ordem de Implementação:**
1. Entidade ModelConfig
2. Repositório de ModelConfig
3. Cliente OpenRouter
4. Cliente modelos privados
5. Commands/Queries de modelos
6. Controller de modelos
7. Preferências por coleção
8. Testes

---

### RF05: Tradução de Linguagem Natural para Trino SQL

**Objetivos:**
- Serviço de construção de prompts (contexto + schema + relacionamentos)
- Geração de SQL via chamada ao modelo IA
- Validação de SQL (sanitização, segurança, lista branca)
- Endpoint de geração
- Endpoint de validação
- Opção de revisão manual antes de executar

**Entregas:**
- ✅ PromptBuilderService
- ✅ Integração com modelos (OpenRouter/Privado)
- ✅ QueryGenerationService
- ✅ QueryValidationService (segurança)
- ✅ Endpoints de geração e validação
- ✅ Testes de segurança (SQL injection)
- ✅ Testes de integração com modelos

**Ordem de Implementação:**
1. PromptBuilderService
2. QueryGenerationService
3. QueryValidationService
4. Commands/Queries de geração
5. Controller de queries (geração/validação)
6. Testes de segurança
7. Testes de integração

---

### RF06: Execução via Trino

**Objetivos:**
- Cliente Trino (HTTP REST)
- Execução de queries federadas
- Tratamento de erros e timeouts
- Carregamento de resultados em memória (MVP)
- Paginação offset-based
- Exportação CSV/JSON

**Entregas:**
- ✅ Cliente Trino (HTTP REST)
- ✅ TrinoService (orquestração)
- ✅ Endpoint de execução
- ✅ Tratamento de erros e timeouts
- ✅ Paginação de resultados
- ✅ Exportação CSV/JSON
- ✅ Testes de integração com Trino

**Ordem de Implementação:**
1. Cliente Trino (HTTP REST)
2. TrinoService
3. Commands/Queries de execução
4. Controller de queries (execução)
5. Paginação e exportação
6. Testes de integração

---

### RF07: Histórico, Auditoria e Logs

**Objetivos:**
- Persistência de histórico de consultas
- Endpoints de histórico
- Estatísticas básicas
- Logs estruturados (Serilog)
- Reexecução de consultas

**Entregas:**
- ✅ Entidade QueryHistory
- ✅ Persistência automática de histórico
- ✅ Endpoints de histórico
- ✅ Endpoint de estatísticas
- ✅ Endpoint de reexecução
- ✅ Logs estruturados
- ✅ Testes

**Ordem de Implementação:**
1. Entidade QueryHistory
2. Repositório de QueryHistory
3. Persistência automática (interceptor/handler)
4. Commands/Queries de histórico
5. Controller de histórico
6. Estatísticas
7. Logs estruturados
8. Testes

---

### Fase Final: Testes, Correções e Documentação

**Objetivos:**
- Testes E2E completos
- Correção de bugs
- Documentação de API
- Performance tuning
- Cache in-memory para schemas e modelos
- Documentação completa

**Entregas:**
- ✅ Suite completa de testes E2E
- ✅ Cache in-memory implementado
- ✅ Documentação atualizada
- ✅ Performance otimizada
- ✅ README completo

**Ordem de Implementação:**
1. Cache in-memory (IMemoryCache)
2. Testes E2E
3. Correções de bugs
4. Otimizações de performance
5. Documentação final

---

## 8. Decisões Técnicas Aprovadas

### 8.1 Autenticação

**Decisão:** ✅ **JWT (JSON Web Tokens)**

**Justificativa:** Permite escalabilidade futura e é adequado para MVP. Suporta refresh tokens e stateless authentication.

**Implementação:**
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- Token com expiração configurável
- Refresh token (futuro, não no MVP inicial)

### 8.2 Criptografia de Credenciais

**Decisão:** ✅ **Variável de Ambiente**

**Justificativa:** Simples e adequado para ambiente local. Chave armazenada em variável de ambiente `ENCRYPTION_KEY`.

**Implementação:**
- AES-GCM para criptografia
- Chave de 256 bits (32 bytes)
- Documentação clara sobre segurança

### 8.3 Versionamento de Schema Snapshots

**Decisão:** ✅ **Histórico Completo**

**Justificativa:** Permite rollback e auditoria. Implementação com limpeza automática após período configurável (ex: 90 dias).

**Implementação:**
- Campo `Version` em SchemaSnapshot
- Manter todos os snapshots históricos
- Job de limpeza automática (futuro)

### 8.4 Streaming de Resultados Trino

**Decisão:** ✅ **Carregar Tudo em Memória (MVP)**

**Justificativa:** Mais simples para MVP. Streaming será implementado na v2.

**Implementação:**
- Carregar todos os resultados em memória
- Limite configurável de linhas (ex: 10.000)
- Paginação offset-based

### 8.5 Paginação de Resultados

**Decisão:** ✅ **Offset-based**

**Justificativa:** Mais simples de implementar e adequado para MVP.

**Implementação:**
- Parâmetros `page` e `pageSize`
- Resposta com metadados de paginação

### 8.6 Processamento Assíncrono

**Decisão:** ✅ **Processamento Síncrono com Timeout**

**Justificativa:** Mais simples para MVP. Background jobs serão considerados na v2 se necessário.

**Implementação:**
- Processamento síncrono
- Timeout configurável (ex: 5 minutos)
- Retorno de progresso quando possível

### 8.7 Cache

**Decisão:** ✅ **In-Memory Cache**

**Justificativa:** Melhora performance sem complexidade adicional. Adequado para ambiente local.

**Implementação:**
- `IMemoryCache` do .NET
- Cache de schemas (TTL: 1 hora)
- Cache de listas de modelos OpenRouter (TTL: 30 minutos)
- Invalidação manual quando necessário

---

## 9. Ambiente e Deploy

### 9.1 Ambiente Local

**Configuração:**
- Desenvolvimento local com Docker Compose
- PostgreSQL para metadados
- PostgreSQL e MongoDB de teste como fontes de dados
- Trino via Docker
- Backend .NET rodando localmente (não containerizado inicialmente)

**Variáveis de Ambiente:**
```env
# Banco de Metadados
METADATA_DB_CONNECTION_STRING=Host=localhost;Port=5432;Database=delfos_metadata;Username=delfos;Password=delfos_password

# Criptografia
ENCRYPTION_KEY=<chave-256-bits-base64>

# JWT
JWT_SECRET=<chave-secreta-jwt>
JWT_ISSUER=Delfos
JWT_AUDIENCE=Delfos
JWT_EXPIRATION_MINUTES=60

# Trino
TRINO_URL=http://localhost:8080

# OpenRouter
OPENROUTER_API_KEY=<sua-chave-openrouter>

# Logging
LOG_LEVEL=Information
```

### 9.2 Docker Compose

O ambiente local será gerenciado via `docker-compose.yml` na raiz do projeto, incluindo:
- PostgreSQL (metadados)
- PostgreSQL (teste)
- MongoDB (teste)
- Trino

---

## 10. Próximos Passos

1. ✅ **Documento de definições aprovado**
2. ✅ **Decisões técnicas definidas**
3. **Iniciar Fase 0: Infraestrutura Base**
   - Criar solução .NET 8
   - Configurar projetos
   - Setup Docker Compose
   - Configurar EF Core
   - Configurar Serilog e Swagger
4. **Seguir ordem de implementação por funcionalidades** (RF08 → RF01 → RF02 → ...)

---

## 11. Referências

- [Documento de Requisitos](../documento-requisitos.md)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Trino Documentation](https://trino.io/docs/)
- [OpenRouter API](https://openrouter.ai/docs)

