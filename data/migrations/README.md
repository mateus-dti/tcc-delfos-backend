# Migrations do Entity Framework Core

Esta pasta contém as migrations geradas pelo Entity Framework Core.

## ⚠️ Importante

**NÃO edite migrations manualmente** após serem criadas e aplicadas em produção.

## Estrutura

As migrations são geradas automaticamente pelo EF Core e seguem o padrão:
```
YYYYMMDDHHMMSS_NomeDaMigration.cs
```

## Comandos Úteis

### Criar Migration
```bash
dotnet ef migrations add NomeDaMigration \
  --project src/Delfos.Infrastructure \
  --startup-project src/Delfos.Api \
  --output-dir data/migrations
```

### Aplicar Migrations
```bash
dotnet ef database update \
  --project src/Delfos.Infrastructure \
  --startup-project src/Delfos.Api
```

### Reverter Migration
```bash
dotnet ef database update NomeDaMigrationAnterior \
  --project src/Delfos.Infrastructure \
  --startup-project src/Delfos.Api
```

### Remover Última Migration (antes de aplicar)
```bash
dotnet ef migrations remove \
  --project src/Delfos.Infrastructure \
  --startup-project src/Delfos.Api
```

### Gerar Script SQL
```bash
dotnet ef migrations script \
  --project src/Delfos.Infrastructure \
  --startup-project src/Delfos.Api \
  --output data/scripts/migration_script.sql
```

## Configuração

O diretório de migrations pode ser configurado no `DelfosDbContext` ou via parâmetro `--output-dir` nos comandos acima.


