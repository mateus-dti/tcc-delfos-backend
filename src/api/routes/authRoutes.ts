import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/login', (req, res) => authController.login(req, res));
  router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req, res));
  router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

  return router;
}

