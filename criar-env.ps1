# Script PowerShell para criar arquivo .env
# Execute: .\criar-env.ps1

Write-Host "🔐 Criando arquivo .env..." -ForegroundColor Cyan

$envContent = @"
# =====================================================
# Configuração do Banco de Dados PostgreSQL
# =====================================================
# AJUSTE ESTAS VARIÁVEIS COM AS CREDENCIAIS DO SEU BANCO

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=seu_usuario_aqui
DB_PASSWORD=sua_senha_aqui
DB_DATABASE=seu_banco_aqui

# =====================================================
# Configuração JWT (Autenticação)
# =====================================================
# IMPORTANTE: Use uma chave secreta com pelo menos 32 caracteres

JWT_SECRET=sua_chave_secreta_jwt_com_pelo_menos_32_caracteres_aqui
JWT_ISSUER=Delfos
JWT_AUDIENCE=Delfos
JWT_EXPIRES_IN=24h

# =====================================================
# Configuração de Criptografia
# =====================================================
# Gere uma chave base64 de 32 bytes

ENCRYPTION_KEY=sua_chave_de_criptografia_base64_32_bytes_aqui

# =====================================================
# Configuração do Servidor
# =====================================================

PORT=5000
NODE_ENV=development
"@

# Verificar se .env já existe
if (Test-Path .env) {
    $resposta = Read-Host "Arquivo .env já existe. Deseja sobrescrever? (s/N)"
    if ($resposta -ne "s" -and $resposta -ne "S") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        exit
    }
}

# Criar arquivo .env
$envContent | Out-File -FilePath .env -Encoding utf8

Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Edite o arquivo .env e ajuste as credenciais do banco de dados" -ForegroundColor Yellow
Write-Host "2. Gere as chaves JWT_SECRET e ENCRYPTION_KEY usando:" -ForegroundColor Yellow
Write-Host "   - JWT_SECRET: node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`"" -ForegroundColor White
Write-Host "   - ENCRYPTION_KEY: node -e `"console.log(require('crypto').randomBytes(32).toString('base64'))`"" -ForegroundColor White
Write-Host "3. Execute: npm run dev" -ForegroundColor Yellow

