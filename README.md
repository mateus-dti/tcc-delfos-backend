# Backend - Delfos API

API REST desenvolvida em .NET para gerenciamento de coleções, fontes de dados, schemas e execução de consultas federadas via Trino.

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

## Funcionalidades Principais

- Gerenciamento de Coleções (RF01)
- Conexão e Extração de Schema (RF02)
- Descoberta e Mapeamento de Relacionamentos (RF03)
- Seleção de Modelo IA (RF04)
- Tradução de Linguagem Natural para Trino SQL (RF05)
- Execução via Trino (RF06)
- Histórico, Auditoria e Logs (RF07)
- Segurança e Permissões (RF08)

## Tecnologias

- .NET 8.0+
- Entity Framework Core
- Serilog (logging)
- Swagger/OpenAPI

