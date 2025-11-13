import { Router } from 'express';
import { CollectionsController } from '../controllers/CollectionsController';
import { authMiddleware } from '../middleware/authMiddleware';

export function createCollectionRoutes(collectionsController: CollectionsController): Router {
  const router = Router();

  router.get('/', authMiddleware, (req, res, next) => collectionsController.getAllCollections(req, res, next));
  router.get('/:id', authMiddleware, (req, res, next) => collectionsController.getCollectionById(req, res, next));
  router.post('/', authMiddleware, (req, res, next) => collectionsController.createCollection(req, res, next));
  router.put('/:id', authMiddleware, (req, res, next) => collectionsController.updateCollection(req, res, next));
  router.delete('/:id', authMiddleware, (req, res, next) => collectionsController.deleteCollection(req, res, next));
  
  // Rotas para gerenciar fontes de dados da coleção
  router.get('/:id/datasources', authMiddleware, (req, res, next) => 
    collectionsController.getCollectionDataSources(req, res, next)
  );
  router.post('/:id/datasources', authMiddleware, (req, res, next) => 
    collectionsController.associateDataSource(req, res, next)
  );
  router.delete('/:id/datasources/:datasourceId', authMiddleware, (req, res, next) => 
    collectionsController.disassociateDataSource(req, res, next)
  );

  return router;
}

