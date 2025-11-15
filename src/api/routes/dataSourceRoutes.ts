import { Router } from 'express';
import { DataSourcesController } from '../controllers/DataSourcesController';
import { authMiddleware } from '../middleware/authMiddleware';

export function createDataSourceRoutes(dataSourcesController: DataSourcesController): Router {
  const router = Router();

  router.post('/', authMiddleware, (req, res, next) => 
    dataSourcesController.createDataSource(req, res, next)
  );
  
  router.get('/', authMiddleware, (req, res, next) => 
    dataSourcesController.getAllDataSources(req, res, next)
  );
  
  router.get('/:id', authMiddleware, (req, res, next) => 
    dataSourcesController.getDataSourceById(req, res, next)
  );
  
  router.post('/:id/extract-schema', authMiddleware, (req, res, next) => 
    dataSourcesController.extractSchema(req, res, next)
  );
  
  router.get('/:id/schema', authMiddleware, (req, res, next) => 
    dataSourcesController.getSchema(req, res, next)
  );
  
  router.put('/:id/schema/metadata', authMiddleware, (req, res, next) => 
    dataSourcesController.updateSchemaMetadata(req, res, next)
  );

  // RF02.3 - Endpoints para reextração e histórico de snapshots
  router.post('/:id/rescan', authMiddleware, (req, res, next) => 
    dataSourcesController.rescanSchema(req, res, next)
  );
  
  router.get('/:id/snapshots', authMiddleware, (req, res, next) => 
    dataSourcesController.getSnapshots(req, res, next)
  );

  router.get('/:id/snapshots/compare', authMiddleware, (req, res, next) => 
    dataSourcesController.compareSnapshots(req, res, next)
  );

  // RF02.3 - Endpoints para agendamento de reextração
  router.post('/:id/rescan/schedule', authMiddleware, (req, res, next) => 
    dataSourcesController.createRescanSchedule(req, res, next)
  );
  
  router.get('/:id/rescan/schedule', authMiddleware, (req, res, next) => 
    dataSourcesController.getRescanSchedules(req, res, next)
  );

  router.delete('/:id/rescan/schedule/:scheduleId', authMiddleware, (req, res, next) => 
    dataSourcesController.deleteRescanSchedule(req, res, next)
  );

  return router;
}

