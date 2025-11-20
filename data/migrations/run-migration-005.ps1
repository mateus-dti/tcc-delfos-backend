# Script para executar migration 005 - Criar tabela Models
# RF04.1 - Listar Modelos Públicos

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Migration 005: Create Models Table" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configurações do banco (Supabase)
$env:PGPASSWORD = "Mjcn2003@"
$PGHOST = "aws-0-us-east-1.pooler.supabase.com"
$PGPORT = "6543"
$PGUSER = "postgres.mpozdnrjxbnxuzbsknbe"
$PGDATABASE = "postgres"
$MIGRATION_FILE = "005_create_models_table.sql"

Write-Host "🔍 Verificando arquivo de migration..." -ForegroundColor Yellow
if (-Not (Test-Path $MIGRATION_FILE)) {
    Write-Host "❌ Erro: Arquivo $MIGRATION_FILE não encontrado!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Arquivo encontrado: $MIGRATION_FILE" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Configurações do banco:" -ForegroundColor Yellow
Write-Host "  Host: $PGHOST" -ForegroundColor Gray
Write-Host "  Port: $PGPORT" -ForegroundColor Gray
Write-Host "  User: $PGUSER" -ForegroundColor Gray
Write-Host "  Database: $PGDATABASE" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Executando migration..." -ForegroundColor Yellow
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f $MIGRATION_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration executada com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📋 Verificando dados inseridos..." -ForegroundColor Yellow
    $QUERY = "SELECT COUNT(*) as total FROM `"Models`"; SELECT name, identifier, origin FROM `"Models`" ORDER BY name LIMIT 5;"
    psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c $QUERY
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "  Migration concluída!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao executar migration!" -ForegroundColor Red
    Write-Host "Código de saída: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
