import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/login', (req, res, next) => authController.login(req, res, next));
  router.get('/me', authMiddleware, (req, res, next) => authController.getCurrentUser(req, res, next));
  router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

  return router;
}

