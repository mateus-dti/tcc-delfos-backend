# Migrations - Delfos Backend

Este diretório contém os scripts SQL de migração do banco de dados.

## Estrutura

- `001_create_tables.sql` - Script inicial de criação de todas as tabelas (Users, Collections, CollectionAccesses)
- `002_add_user_role.sql` - Adiciona campo role na tabela Users
- `003_create_datasources_table.sql` - Cria tabela DataSources para fontes de dados
- `003_create_datasources_table_execute.sql` - Versão executável da migration 003 (com verificações)

## Como executar

### Opção 1: Via psql (linha de comando)

```bash
# Executar migrations em ordem
psql -h localhost -U delfos -d delfos_metadata -f data/migrations/001_create_tables.sql
psql -h localhost -U delfos -d delfos_metadata -f data/migrations/002_add_user_role.sql
psql -h localhost -U delfos -d delfos_metadata -f data/migrations/003_create_datasources_table.sql
```

### Opção 2: Via Docker

```bash
# Executar migrations em ordem
docker exec -i delfos-postgres psql -U delfos -d delfos_metadata < data/migrations/001_create_tables.sql
docker exec -i delfos-postgres psql -U delfos -d delfos_metadata < data/migrations/002_add_user_role.sql
docker exec -i delfos-postgres psql -U delfos -d delfos_metadata < data/migrations/003_create_datasources_table.sql
```

### Opção 3: Via TypeORM (recomendado para desenvolvimento)

O TypeORM está configurado com `synchronize: true` em desenvolvimento, então as tabelas são criadas automaticamente. Para produção, use migrations.

## Tabelas Criadas

1. **Users** - Usuários do sistema
2. **Collections** - Coleções de fontes de dados
3. **CollectionAccesses** - Permissões de acesso às coleções
4. **DataSources** - Fontes de dados associadas às coleções (PostgreSQL, MongoDB)

## Observações

- Todas as tabelas usam UUID como chave primária
- Soft delete implementado via campo `isActive`
- Triggers automáticos para atualização de `updatedAt`
- Índices criados para otimização de consultas
- Foreign keys com ações apropriadas (CASCADE/RESTRICT)

