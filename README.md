# Backend - Delfos API

API REST desenvolvida em .NET 8 para gerenciamento de coleções, fontes de dados, schemas e execução de consultas federadas via Trino.

## 📚 Documentação

- **[Definições do Projeto](./DEFINICOES.md)** - Documento completo com arquitetura, modelagem, APIs e plano de implementação
- **[Documento de Requisitos](../documento-requisitos.md)** - Requisitos funcionais e não-funcionais do sistema

## 🚀 Inicialização do Repositório

Este módulo possui seu próprio repositório Git. Para inicializar:

```bash
cd backend
git init
git remote add origin <url-do-repositorio-backend>
git add .
git commit -m "Initial commit: Backend structure"
git branch -M main
git push -u origin main
```

## 📁 Estrutura

- **Delfos.Api**: Camada de apresentação (Controllers, Middleware, Configurações)
- **Delfos.Application**: Lógica de aplicação (Commands, Queries, Services, DTOs)
- **Delfos.Domain**: Entidades de domínio, interfaces e value objects
- **Delfos.Infrastructure**: Implementações (Data Access, Repositories, Serviços externos)

## 🎯 Funcionalidades Principais

- **RF08**: Segurança e Permissões (Autenticação JWT, CRUD de Usuários)
- **RF01**: Gerenciamento de Coleções
- **RF02**: Conexão e Extração de Schema (PostgreSQL, MongoDB)
- **RF03**: Descoberta e Mapeamento de Relacionamentos
- **RF04**: Seleção de Modelo IA (OpenRouter + Modelos Privados)
- **RF05**: Tradução de Linguagem Natural para Trino SQL
- **RF06**: Execução via Trino
- **RF07**: Histórico, Auditoria e Logs

## 🛠️ Tecnologias

- **.NET 8.0** - Framework principal
- **ASP.NET Core** - Web API framework
- **Entity Framework Core 8.0** - ORM
- **PostgreSQL** - Banco de metadados
- **Serilog** - Logging estruturado
- **Swagger/OpenAPI** - Documentação de API
- **MediatR** - CQRS pattern
- **FluentValidation** - Validação
- **AutoMapper** - Mapeamento DTO ↔ Entity
- **BCrypt** - Hash de senhas
- **JWT Bearer** - Autenticação

## 🏗️ Arquitetura

O projeto segue **Clean Architecture** com separação em camadas:

- **Presentation Layer** (Delfos.Api): Controllers, Middleware, Configurações
- **Application Layer** (Delfos.Application): Use Cases, Commands, Queries, Services
- **Domain Layer** (Delfos.Domain): Entidades, Interfaces, Value Objects
- **Infrastructure Layer** (Delfos.Infrastructure): EF Core, Repositories, External Services

## 📋 Plano de Implementação

O desenvolvimento será realizado **por funcionalidades**, seguindo a ordem:

1. **Fase 0**: Infraestrutura Base
2. **RF08**: Segurança e Permissões
3. **RF01**: Gerenciar Coleções
4. **RF02**: Conexão e Extração de Schema
5. **RF03**: Descoberta de Relacionamentos
6. **RF04**: Seleção de Modelo IA
7. **RF05**: Tradução NL → SQL
8. **RF06**: Execução via Trino
9. **RF07**: Histórico e Auditoria
10. **Fase Final**: Testes e Documentação

Consulte [DEFINICOES.md](./DEFINICOES.md) para detalhes completos.

## 🔧 Pré-requisitos

- .NET 8.0 SDK
- Docker e Docker Compose
- PostgreSQL (via Docker)
- Trino (via Docker)

## 🚀 Como Executar

```bash
# Subir serviços Docker (PostgreSQL, MongoDB, Trino)
docker-compose up -d

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Restaurar dependências
dotnet restore

# Executar migrations
dotnet ef database update --project src/Delfos.Infrastructure --startup-project src/Delfos.Api

# Executar API
dotnet run --project src/Delfos.Api
```

A API estará disponível em `http://localhost:5000` (ou porta configurada) e o Swagger em `http://localhost:5000/swagger`.

