# Scripts SQL Customizados

Esta pasta contém scripts SQL para manutenção, correções e otimizações do banco de dados.

## Tipos de Scripts

### Manutenção
Scripts para:
- Limpeza de dados antigos
- Otimização de índices
- Análise de performance
- Vacuum e reindex

### Correções
Scripts para corrigir problemas específicos:
- Migração de dados
- Correção de inconsistências
- Atualização de schemas

### Análises
Scripts para análise e relatórios:
- Estatísticas de uso
- Análise de crescimento
- Relatórios de auditoria

## Convenção de Nomenclatura

```
YYYYMMDD_HHMMSS_DescricaoDoScript.sql
```

Exemplo:
```
20250111_221500_CleanupOldQueryHistory.sql
```

## Como Executar

```bash
# Via psql
psql -h localhost -U delfos -d delfos_metadata -f scripts/nome_do_script.sql

# Via Docker
docker exec -i delfos-metadata-db psql -U delfos -d delfos_metadata < scripts/nome_do_script.sql
```

## ⚠️ Importante

- Sempre fazer backup antes de executar scripts de manutenção
- Testar em ambiente de desenvolvimento primeiro
- Documentar o propósito de cada script no cabeçalho



