import { Router } from 'express';
import { ModelsController } from '../controllers/ModelsController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * Rotas para endpoints de modelos de IA
 * RF04.1 - CRUD de Modelos de IA
 */
const router = Router();
const modelsController = new ModelsController();

/**
 * @route GET /api/models
 * @desc Lista todos os modelos disponíveis
 * @access Private
 */
router.get(
  '/',
  authMiddleware,
  (req, res, next) => modelsController.getModels(req, res, next)
);

/**
 * @route POST /api/models
 * @desc Cria um novo modelo
 * @access Private
 */
router.post(
  '/',
  authMiddleware,
  (req, res, next) => modelsController.createModel(req, res, next)
);

/**
 * @route PUT /api/models/:id
 * @desc Atualiza um modelo existente
 * @access Private
 */
router.put(
  '/:id',
  authMiddleware,
  (req, res, next) => modelsController.updateModel(req, res, next)
);

/**
 * @route DELETE /api/models/:id
 * @desc Deleta um modelo (soft delete)
 * @access Private
 */
router.delete(
  '/:id',
  authMiddleware,
  (req, res, next) => modelsController.deleteModel(req, res, next)
);

export default router;
