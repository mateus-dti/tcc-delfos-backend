import { Router } from 'express';
import { UsersController } from '../controllers/UsersController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin, requireManagerOrAdmin } from '../middleware/roleMiddleware';

export function createUserRoutes(usersController: UsersController): Router {
  const router = Router();

  // Listar usuários - apenas admin e manager
  router.get('/', authMiddleware, requireManagerOrAdmin, (req, res, next) => usersController.getAllUsers(req, res, next));
  
  // Obter usuário por ID - apenas admin e manager
  router.get('/:id', authMiddleware, requireManagerOrAdmin, (req, res, next) => usersController.getUserById(req, res, next));
  
  // Criar usuário - público (mas role só pode ser definida por admin)
  router.post('/', (req, res, next) => usersController.createUser(req, res, next));
  
  // Atualizar usuário - apenas admin pode alterar role
  router.put('/:id', authMiddleware, (req, res, next) => usersController.updateUser(req, res, next));
  
  // Excluir usuário - apenas admin
  router.delete('/:id', authMiddleware, requireAdmin, (req, res, next) => usersController.deleteUser(req, res, next));

  return router;
}

