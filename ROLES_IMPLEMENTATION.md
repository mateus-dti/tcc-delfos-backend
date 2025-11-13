# 🔐 Implementação de Roles de Usuário

## 📋 Roles Disponíveis

O sistema possui três roles de usuário:

1. **`default`** - Usuário padrão (padrão para novos usuários)
2. **`manager`** - Gerente (acesso intermediário)
3. **`admin`** - Administrador (acesso total)

## 🏗️ Estrutura Implementada

### Enum UserRole
- **Arquivo:** `src/domain/enums/UserRole.ts`
- Define os três tipos de roles disponíveis

### Entidade User
- **Campo adicionado:** `role` (enum UserRole)
- **Valor padrão:** `UserRole.Default`
- Armazenado no banco de dados como enum PostgreSQL

### Middleware de Autorização
- **Arquivo:** `src/api/middleware/roleMiddleware.ts`
- **Funções disponíveis:**
  - `requireRole(allowedRoles)` - Verifica se usuário tem uma das roles permitidas
  - `requireAdmin()` - Verifica se usuário é admin
  - `requireManagerOrAdmin()` - Verifica se usuário é manager ou admin

## 🔒 Regras de Autorização

### Endpoints de Usuários

| Endpoint | Método | Autenticação | Roles Permitidas |
|----------|--------|--------------|------------------|
| `/api/users` | GET | ✅ | manager, admin |
| `/api/users/:id` | GET | ✅ | manager, admin |
| `/api/users` | POST | ❌ | Público (mas apenas admin pode definir role) |
| `/api/users/:id` | PUT | ✅ | Todos (mas apenas admin pode alterar role/isActive) |
| `/api/users/:id` | DELETE | ✅ | admin |

### Regras Especiais

1. **Criar Usuário (POST /api/users)**
   - Endpoint público (não requer autenticação)
   - Qualquer um pode criar usuário
   - Se `role` for fornecido, apenas admin pode definir
   - Se não fornecido, usa `default`

2. **Atualizar Usuário (PUT /api/users/:id)**
   - Requer autenticação
   - Qualquer usuário autenticado pode atualizar email e senha
   - Apenas admin pode alterar `role` e `isActive`

3. **Listar/Obter Usuários**
   - Apenas manager e admin podem listar/obter usuários

4. **Excluir Usuário**
   - Apenas admin pode excluir usuários

## 📝 DTOs Atualizados

### CreateUserRequest
```typescript
{
  username: string;
  email: string;
  password: string;
  role?: UserRole; // Opcional, apenas admin pode definir
}
```

### UpdateUserRequest
```typescript
{
  email?: string;
  password?: string;
  role?: UserRole; // Apenas admin pode alterar
  isActive?: boolean; // Apenas admin pode alterar
}
```

### UserDto
```typescript
{
  id: string;
  username: string;
  email: string;
  role: UserRole; // Sempre retornado
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}
```

## 🔑 Token JWT

O token JWT agora inclui a role do usuário:

```json
{
  "sub": "user-id",
  "name": "username",
  "email": "user@example.com",
  "role": "admin",
  "jti": "token-id"
}
```

## 🗄️ Migration do Banco de Dados

Execute a migration para adicionar o campo role:

```sql
-- Criar enum
CREATE TYPE user_role AS ENUM ('default', 'manager', 'admin');

-- Adicionar coluna
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "role" user_role NOT NULL DEFAULT 'default';

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users"("role");
```

**Arquivo:** `data/migrations/002_add_user_role.sql`

## 📚 Exemplos de Uso

### Criar Usuário com Role (apenas admin)

```bash
# Como admin
POST /api/users
Authorization: Bearer <admin-token>
{
  "username": "novousuario",
  "email": "novo@example.com",
  "password": "senha123",
  "role": "manager"
}
```

### Criar Usuário Sem Role (público)

```bash
# Sem autenticação
POST /api/users
{
  "username": "novousuario",
  "email": "novo@example.com",
  "password": "senha123"
}
# Role será 'default' automaticamente
```

### Atualizar Role de Usuário (apenas admin)

```bash
PUT /api/users/:id
Authorization: Bearer <admin-token>
{
  "role": "manager"
}
```

### Usar Middleware em Rotas Customizadas

```typescript
import { requireAdmin, requireManagerOrAdmin, requireRole } from '../middleware/roleMiddleware';
import { UserRole } from '../../domain/enums/UserRole';

// Apenas admin
router.get('/admin-only', authMiddleware, requireAdmin, handler);

// Admin ou manager
router.get('/manager-or-admin', authMiddleware, requireManagerOrAdmin, handler);

// Roles específicas
router.get('/custom', authMiddleware, requireRole([UserRole.Manager]), handler);
```

## ✅ Checklist de Implementação

- [x] Enum UserRole criado
- [x] Campo role adicionado na entidade User
- [x] Migration SQL criada
- [x] DTOs atualizados (CreateUserRequest, UpdateUserRequest, UserDto)
- [x] Commands atualizados (CreateUserCommand, UpdateUserCommand)
- [x] Handlers atualizados (todos os handlers de User)
- [x] Middleware de autorização criado
- [x] Rotas protegidas com middleware de role
- [x] Validações no controller (apenas admin pode definir/alterar role)
- [x] Token JWT inclui role
- [x] AuthRequest interface atualizada com role

## 🧪 Testes Recomendados

1. Criar usuário sem role (deve ser 'default')
2. Criar usuário com role como admin (deve funcionar)
3. Criar usuário com role como não-admin (deve retornar 403)
4. Atualizar role como admin (deve funcionar)
5. Atualizar role como não-admin (deve retornar 403)
6. Listar usuários como manager/admin (deve funcionar)
7. Listar usuários como default (deve retornar 403)
8. Excluir usuário como admin (deve funcionar)
9. Excluir usuário como não-admin (deve retornar 403)

