# Banco de Dados Interno - Delfos

Esta pasta contém todos os arquivos relacionados ao banco de dados interno da aplicação, usado para armazenar metadados, usuários e outras informações internas.

## 📁 Estrutura

```
data/
├── migrations/     # Migrations do Entity Framework Core
├── scripts/        # Scripts SQL customizados e de manutenção
├── backups/        # Backups do banco de dados (não versionados)
└── seeds/          # Scripts de seed para dados iniciais
```

## 🗄️ Banco de Dados

**Tecnologia:** PostgreSQL 16  
**Nome do Banco:** `delfos_metadata`  
**Host:** localhost (via Docker)  
**Porta:** 5432

## 📝 Migrations

As migrations do Entity Framework Core são geradas automaticamente e armazenadas em `data/migrations/`.

### Comandos Úteis

```bash
# Criar nova migration
dotnet ef migrations add NomeDaMigration --project src/Delfos.Infrastructure --startup-project src/Delfos.Api

# Aplicar migrations
dotnet ef database update --project src/Delfos.Infrastructure --startup-project src/Delfos.Api

# Reverter última migration
dotnet ef database update NomeDaMigrationAnterior --project src/Delfos.Infrastructure --startup-project src/Delfos.Api
```

## 🔧 Scripts

Scripts SQL customizados para:
- Manutenção do banco
- Correções de dados
- Otimizações
- Análises

## 💾 Backups

**⚠️ IMPORTANTE:** A pasta `backups/` está no `.gitignore` e não deve ser versionada.

Backups devem ser feitos periodicamente e armazenados em local seguro.

## 🌱 Seeds

Scripts de seed para popular o banco com dados iniciais:
- Usuário administrador padrão
- Configurações iniciais
- Dados de exemplo (opcional)

## 🔐 Segurança

- Credenciais do banco são armazenadas em variáveis de ambiente
- Nunca commitar credenciais ou informações sensíveis
- Backups devem ser criptografados



