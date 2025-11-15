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

  // RF03.2 - Descoberta de relacionamentos
  router.post('/:id/discover-relationships', authMiddleware, (req, res, next) => 
    collectionsController.discoverRelationships(req, res, next)
  );

  // RF03.3 - Gerenciar relacionamentos
  router.get('/:id/relationships', authMiddleware, (req, res, next) => 
    collectionsController.getCollectionRelationships(req, res, next)
  );
  router.post('/:id/relationships', authMiddleware, (req, res, next) => 
    collectionsController.createRelationship(req, res, next)
  );
  router.put('/:id/relationships/:relationshipId', authMiddleware, (req, res, next) => 
    collectionsController.updateRelationship(req, res, next)
  );
  router.delete('/:id/relationships/:relationshipId', authMiddleware, (req, res, next) => 
    collectionsController.deleteRelationship(req, res, next)
  );

  return router;
}

