# 📮 Coleção Postman - Delfos Backend API

## 📥 Como Importar

1. Abra o **Postman**
2. Clique em **Import** (canto superior esquerdo)
3. Selecione o arquivo `Delfos_API.postman_collection.json`
4. A coleção será importada com todos os endpoints

## 🔧 Configuração Inicial

### Variáveis da Coleção

A coleção já vem com variáveis pré-configuradas:

- **`baseUrl`**: `http://localhost:5000` (ajuste se necessário)
- **`token`**: Será preenchido automaticamente após login
- **`userId`**: Será preenchido automaticamente após criar usuário
- **`collectionId`**: Será preenchido automaticamente após criar coleção

### Para Ajustar a URL Base

1. Clique com botão direito na coleção
2. Selecione **Edit**
3. Vá na aba **Variables**
4. Ajuste o valor de `baseUrl` se necessário

## 🚀 Como Usar

### 1. Verificar se a API está funcionando

Execute primeiro: **Health Check** → **Health Check**

Deve retornar: `{"status":"ok","timestamp":"..."}`

### 2. Criar um Usuário (Opcional)

Execute: **Usuários** → **Criar Usuário**

Edite o body com seus dados:
```json
{
  "username": "meuusuario",
  "email": "meu@email.com",
  "password": "minhasenha123"
}
```

### 3. Fazer Login

Execute: **Autenticação** → **Login**

Edite o body com suas credenciais:
```json
{
  "username": "meuusuario",
  "password": "minhasenha123"
}
```

**Importante:** O token será salvo automaticamente na variável `token` e será usado em todas as requisições subsequentes.

### 4. Testar Endpoints Protegidos

Agora você pode executar qualquer endpoint que requer autenticação. O token será incluído automaticamente.

## 📋 Endpoints Disponíveis

### ✅ Health Check
- `GET /health` - Verifica status da API

### 🔐 Autenticação
- `POST /api/auth/login` - Login (retorna token JWT)
- `GET /api/auth/me` - Obter usuário atual
- `POST /api/auth/logout` - Logout

### 👥 Usuários
- `POST /api/users` - Criar usuário (público)
- `GET /api/users` - Listar usuários (requer auth)
- `GET /api/users/:id` - Obter usuário por ID (requer auth)
- `PUT /api/users/:id` - Atualizar usuário (requer auth)
- `DELETE /api/users/:id` - Excluir usuário (requer auth)

### 📦 Coleções
- `POST /api/collections` - Criar coleção (requer auth)
- `GET /api/collections` - Listar coleções do usuário (requer auth)
- `GET /api/collections/:id` - Obter coleção por ID (requer auth)
- `PUT /api/collections/:id` - Atualizar coleção (requer auth)
- `DELETE /api/collections/:id` - Excluir coleção (requer auth)

## 🎯 Fluxo de Teste Recomendado

1. ✅ **Health Check** - Verificar se API está rodando
2. 👤 **Criar Usuário** - Criar uma conta de teste
3. 🔐 **Login** - Obter token JWT (salvo automaticamente)
4. 📦 **Criar Coleção** - Criar uma coleção de teste
5. 📋 **Listar Coleções** - Ver todas as coleções
6. 🔍 **Obter Coleção por ID** - Ver detalhes de uma coleção
7. ✏️ **Atualizar Coleção** - Modificar uma coleção
8. 🗑️ **Excluir Coleção** - Remover uma coleção (soft delete)

## 🔄 Automação de Variáveis

A coleção possui scripts automáticos que:

- **Após Login:** Salva o token JWT na variável `token`
- **Após Criar Usuário:** Salva o ID do usuário na variável `userId`
- **Após Criar Coleção:** Salva o ID da coleção na variável `collectionId`

Essas variáveis são usadas automaticamente nas requisições subsequentes.

## 🐛 Troubleshooting

### Erro 401 Unauthorized
- Certifique-se de ter feito login primeiro
- Verifique se o token foi salvo corretamente
- Tente fazer login novamente

### Erro 404 Not Found
- Verifique se o servidor está rodando (`npm run dev`)
- Verifique se a URL base está correta (`http://localhost:5000`)

### Erro 500 Internal Server Error
- Verifique os logs do servidor
- Certifique-se de que o banco de dados está configurado corretamente
- Verifique se o arquivo `.env` está configurado

### Variáveis não estão sendo salvas
- Verifique se os scripts de teste estão habilitados
- Certifique-se de que a resposta está retornando os dados esperados
- Verifique o console do Postman para ver mensagens de debug

## 📝 Exemplos de Respostas

### Login Bem-sucedido
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-11-14T04:46:12.000Z",
  "user": {
    "id": "uuid-do-usuario",
    "username": "meuusuario",
    "email": "meu@email.com",
    "isActive": true,
    "createdAt": "2025-11-13T04:46:12.000Z",
    "lastLoginAt": "2025-11-13T04:46:12.000Z"
  }
}
```

### Coleção Criada
```json
{
  "id": "uuid-da-colecao",
  "name": "Minha Coleção",
  "description": "Descrição da minha coleção",
  "ownerId": "uuid-do-usuario",
  "owner": {
    "id": "uuid-do-usuario",
    "username": "meuusuario",
    "email": "meu@email.com"
  },
  "isActive": true,
  "createdAt": "2025-11-13T04:46:12.000Z",
  "updatedAt": "2025-11-13T04:46:12.000Z"
}
```

## 💡 Dicas

- Use o **Collection Runner** do Postman para executar todos os testes em sequência
- Crie um **Environment** separado para desenvolvimento e produção
- Exporte a coleção regularmente para backup
- Use **Pre-request Scripts** para gerar dados dinâmicos se necessário

