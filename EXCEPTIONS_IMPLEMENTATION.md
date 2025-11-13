# 🛡️ Sistema de Tratamento de Exceções

## 📋 Visão Geral

Implementado um sistema completo de tratamento de exceções com mensagens explicativas em português para melhor experiência do usuário.

## 🏗️ Estrutura de Exceções

### Classes de Exceção Customizadas

Todas as exceções herdam de `AppException` e estão localizadas em `src/domain/exceptions/`:

1. **`AppException`** (Classe Base)
   - Classe abstrata base para todas as exceções
   - Propriedades: `statusCode`, `errorCode`, `message`, `details`
   - Método `toJSON()` para serialização

2. **`ValidationException`** (400)
   - Erros de validação de dados
   - Inclui lista de erros de validação

3. **`NotFoundException`** (404)
   - Recurso não encontrado
   - Mensagem: "Recurso com identificador 'X' não encontrado"

4. **`UnauthorizedException`** (401)
   - Erros de autenticação
   - Token ausente, inválido ou expirado

5. **`ForbiddenException`** (403)
   - Acesso negado por falta de permissão
   - Mensagens explicativas sobre roles necessárias

6. **`ConflictException`** (409)
   - Conflitos (ex: recurso já existe)
   - Identifica o campo em conflito

7. **`DatabaseException`** (500)
   - Erros de banco de dados
   - Captura erros originais para logging

## 📝 Formato de Resposta

Todas as exceções retornam no formato:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem explicativa em português",
    "details": {
      // Detalhes adicionais (opcional)
    }
  }
}
```

## 🔧 Implementação nos Handlers

### Exemplo: CreateUserCommandHandler

```typescript
async handle(command: CreateUserCommand): Promise<UserDto> {
  try {
    if (await this.userRepository.existsByUsername(command.username)) {
      throw new ConflictException(
        `O nome de usuário '${command.username}' já está em uso. Por favor, escolha outro nome.`,
        'username'
      );
    }
    // ... resto do código
  } catch (error) {
    if (error instanceof ConflictException) {
      throw error; // Re-lança exceções da aplicação
    }
    throw new DatabaseException(
      'Erro ao criar usuário. Por favor, tente novamente.',
      error
    );
  }
}
```

## 🎯 Middleware de Tratamento de Erros

O `errorHandlerMiddleware` trata automaticamente:

1. **Exceções Customizadas** - Retorna formato JSON padronizado
2. **Erros de Validação** - Converte para `ValidationException`
3. **Erros de Banco de Dados** - Detecta padrões e converte para `DatabaseException` ou `ConflictException`
4. **Erros Genéricos** - Retorna erro 500 com mensagem apropriada

### Logging

- **Exceções da Aplicação**: Logged como `warn` (não crítico)
- **Erros de Banco de Dados**: Logged como `error` (crítico)
- **Erros Genéricos**: Logged como `error` com stack trace completo

## 📚 Mensagens de Exceção por Contexto

### Autenticação

- **Token ausente**: "Token de autenticação não fornecido. Por favor, faça login novamente."
- **Token expirado**: "Seu token de autenticação expirou. Por favor, faça login novamente."
- **Token inválido**: "Token de autenticação inválido. Por favor, faça login novamente."

### Autorização

- **Sem permissão**: "Acesso negado. Esta ação requer permissão de [role]. Sua role atual: [role atual]."
- **Apenas owner**: "Você só pode [ação] suas próprias [recursos]."

### Validação

- **Username duplicado**: "O nome de usuário 'X' já está em uso. Por favor, escolha outro nome."
- **Email duplicado**: "O email 'X' já está cadastrado. Por favor, use outro email ou faça login."
- **Senha curta**: "A senha deve ter pelo menos 6 caracteres."
- **Coleção duplicada**: "Você já possui uma coleção com o nome 'X'. Por favor, escolha outro nome."

### Recursos Não Encontrados

- **Usuário**: "Usuário com identificador 'X' não encontrado"
- **Coleção**: "Coleção com identificador 'X' não encontrado"

### Banco de Dados

- **Erro genérico**: "Erro ao [ação] [recurso]. Por favor, tente novamente."
- **Erro de conexão**: "Erro ao conectar com o banco de dados. Tente novamente mais tarde."

## 🔍 Detecção Automática de Erros

O middleware detecta automaticamente:

- **Conflitos**: Mensagens contendo "duplicate key", "unique constraint", "already exists"
- **Erros de Conexão**: Mensagens contendo "ECONNREFUSED", "connection", "database", "timeout"
- **Erros de Validação**: Arrays de erros do `class-validator`

## ✅ Benefícios

1. **Mensagens Claras**: Todas as mensagens em português e explicativas
2. **Códigos de Status Corretos**: Cada tipo de erro retorna o status HTTP apropriado
3. **Logging Estruturado**: Logs detalhados para debugging
4. **Consistência**: Formato padronizado de resposta
5. **Manutenibilidade**: Fácil adicionar novos tipos de exceção
6. **Experiência do Usuário**: Mensagens úteis que ajudam o usuário a resolver problemas

## 📖 Exemplos de Uso

### Criar Exceção Customizada

```typescript
throw new NotFoundException('Usuário', userId);
// Retorna: "Usuário com identificador 'userId' não encontrado"
```

### Exceção com Detalhes

```typescript
throw new ConflictException(
  'O email já está em uso',
  'email'
);
// Retorna JSON com conflictingField: 'email'
```

### Tratamento em Handler

```typescript
try {
  // código que pode lançar exceções
} catch (error) {
  if (error instanceof AppException) {
    throw error; // Re-lança exceções da aplicação
  }
  throw new DatabaseException('Mensagem genérica', error);
}
```

## 🎨 Formato de Resposta de Erro

### Desenvolvimento

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Usuário com identificador '123' não encontrado",
    "details": {
      "resource": "Usuário",
      "identifier": "123"
    }
  }
}
```

### Produção

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde."
  }
}
```

## 🔐 Segurança

- **Stack Traces**: Apenas em desenvolvimento
- **Detalhes Sensíveis**: Não expostos em produção
- **Logging**: Detalhes completos apenas nos logs do servidor

