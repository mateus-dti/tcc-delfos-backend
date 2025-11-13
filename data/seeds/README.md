# Scripts de Seed

Esta pasta contém scripts para popular o banco de dados com dados iniciais.

## Scripts Disponíveis

### 01_InitialAdminUser.sql
Cria o usuário administrador padrão do sistema.

**Credenciais padrão (DEV):**
- Username: `admin`
- Email: `admin@delfos.local`
- Password: `Admin@123` (deve ser alterado em produção)

### Como Executar

```bash
# Via psql
psql -h localhost -U delfos -d delfos_metadata -f seeds/01_InitialAdminUser.sql

# Via Docker
docker exec -i delfos-metadata-db psql -U delfos -d delfos_metadata < seeds/01_InitialAdminUser.sql
```

## ⚠️ Importante

- Scripts de seed devem ser idempotentes (pode executar múltiplas vezes sem erro)
- Nunca incluir senhas em texto plano em produção
- Use variáveis de ambiente ou secrets para dados sensíveis


