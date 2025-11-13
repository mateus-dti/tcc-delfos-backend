# Backend - Delfos API (Node.js)

API REST desenvolvida em Node.js/TypeScript para gerenciamento de coleções, fontes de dados, schemas e execução de consultas federadas via Trino.

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

O projeto segue **Clean Architecture** com separação em camadas:

```
src/
├── api/                    # Camada de apresentação (Controllers, Routes, Middleware)
│   ├── controllers/
│   ├── routes/
│   └── middleware/
├── application/            # Lógica de aplicação (Commands, Queries, DTOs)
│   ├── commands/
│   ├── queries/
│   └── dto/
├── domain/                 # Entidades de domínio, interfaces e enums
│   ├── entities/
│   ├── interfaces/
│   └── enums/
└── infrastructure/         # Implementações (Data Access, Repositories, Serviços externos)
    ├── data/
    ├── repositories/
    ├── services/
    └── config/
```

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

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express.js** - Web framework
- **TypeORM** - ORM
- **PostgreSQL** - Banco de metadados
- **Winston** - Logging estruturado
- **Swagger/OpenAPI** - Documentação de API (futuro)
- **CQRS Pattern** - Separação de comandos e queries
- **class-validator** - Validação
- **bcrypt** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT
- **crypto** - Criptografia AES-GCM

## 🏗️ Arquitetura

O projeto segue **Clean Architecture** com separação em camadas:

- **Presentation Layer** (api): Controllers, Routes, Middleware
- **Application Layer** (application): Use Cases, Commands, Queries, DTOs
- **Domain Layer** (domain): Entidades, Interfaces, Enums
- **Infrastructure Layer** (infrastructure): TypeORM, Repositories, External Services

## 📋 Plano de Implementação

O desenvolvimento será realizado **por funcionalidades**, seguindo a ordem:

1. **Fase 0**: Infraestrutura Base ✅
2. **RF08**: Segurança e Permissões ✅
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

- Node.js 18+ e npm
- Docker e Docker Compose
- PostgreSQL (via Docker)

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Subir serviços Docker (PostgreSQL)
docker-compose up -d

# Executar migrations (TypeORM criará as tabelas automaticamente em desenvolvimento)
npm run migration:run

# Executar em modo desenvolvimento
npm run dev

# Executar em modo produção
npm run build
npm start
```

A API estará disponível em `http://localhost:5000` (ou porta configurada).

## 📝 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Obter usuário atual (requer autenticação)
- `POST /api/auth/logout` - Logout (requer autenticação)

### Usuários
- `GET /api/users` - Listar usuários (requer autenticação)
- `GET /api/users/:id` - Obter usuário por ID (requer autenticação)
- `POST /api/users` - Criar usuário (público)
- `PUT /api/users/:id` - Atualizar usuário (requer autenticação)
- `DELETE /api/users/:id` - Desativar usuário (requer autenticação)

### Health Check
- `GET /health` - Verificar status da API

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após fazer login, inclua o token no header:

```
Authorization: Bearer <token>
```

## 📦 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot-reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Executa a aplicação em modo produção
- `npm run migration:generate` - Gera uma nova migration
- `npm run migration:run` - Executa migrations pendentes
- `npm run migration:revert` - Reverte a última migration

## 🧪 Testes

(Em desenvolvimento)

## 📄 Licença

ISC
