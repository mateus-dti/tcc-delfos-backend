import { Router } from 'express';
import { UsersController } from '../controllers/UsersController';
import { authMiddleware } from '../middleware/authMiddleware';

export function createUserRoutes(usersController: UsersController): Router {
  const router = Router();

  router.get('/', authMiddleware, (req, res) => usersController.getAllUsers(req, res));
  router.get('/:id', authMiddleware, (req, res) => usersController.getUserById(req, res));
  router.post('/', (req, res) => usersController.createUser(req, res)); // Allow registration without auth
  router.put('/:id', authMiddleware, (req, res) => usersController.updateUser(req, res));
  router.delete('/:id', authMiddleware, (req, res) => usersController.deleteUser(req, res));

  return router;
}

