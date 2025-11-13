#!/usr/bin/env node

/**
 * Script para gerar chaves de segurança necessárias para o backend
 */

const crypto = require('crypto');

console.log('\n🔐 Gerando chaves de segurança...\n');
console.log('='.repeat(60));

// Gerar JWT_SECRET (hex, 64 caracteres = 32 bytes)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📝 JWT_SECRET (cole no arquivo .env):');
console.log('─'.repeat(60));
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('─'.repeat(60));

// Gerar ENCRYPTION_KEY (base64, 32 bytes)
const encryptionKey = crypto.randomBytes(32).toString('base64');
console.log('\n🔒 ENCRYPTION_KEY (cole no arquivo .env):');
console.log('─'.repeat(60));
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log('─'.repeat(60));

// Verificar tamanho
console.log('\n✅ Validação:');
console.log(`   JWT_SECRET length: ${jwtSecret.length} caracteres`);
console.log(`   ENCRYPTION_KEY length: ${encryptionKey.length} caracteres`);
console.log(`   ENCRYPTION_KEY bytes: ${Buffer.from(encryptionKey, 'base64').length} bytes`);

console.log('\n' + '='.repeat(60));
console.log('\n💡 Dica: Copie as chaves acima para o arquivo .env na raiz do projeto\n');

