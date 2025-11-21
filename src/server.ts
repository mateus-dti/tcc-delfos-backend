import 'reflect-metadata';
import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports that might use them
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import { AppDataSource } from './infrastructure/data/data-source';
import { createLogger } from './infrastructure/config/logger';
import { requestLoggingMiddleware } from './api/middleware/requestLoggingMiddleware';
import { errorHandlerMiddleware } from './api/middleware/errorHandlerMiddleware';
import { createAuthRoutes } from './api/routes/authRoutes';
import { createUserRoutes } from './api/routes/userRoutes';
import { createCollectionRoutes } from './api/routes/collectionRoutes';
import { createDataSourceRoutes } from './api/routes/dataSourceRoutes';
import modelsRoutes from './api/routes/models';
import { AuthController } from './api/controllers/AuthController';
import { UsersController } from './api/controllers/UsersController';
import { QueryController } from './api/controllers/QueryController';
import { CollectionsController } from './api/controllers/CollectionsController';
import { DataSourcesController } from './api/controllers/DataSourcesController';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { CollectionRepository } from './infrastructure/repositories/CollectionRepository';
import { DataSourceRepository } from './infrastructure/repositories/DataSourceRepository';
import { PasswordHasherService } from './infrastructure/services/PasswordHasherService';
import { EncryptionService } from './infrastructure/services/EncryptionService';
import { LoginCommandHandler } from './application/commands/auth/LoginCommandHandler';
import { GetCurrentUserQueryHandler } from './application/queries/auth/GetCurrentUserQueryHandler';
import { GetAllUsersQueryHandler } from './application/queries/users/GetAllUsersQueryHandler';
import { GetUserByIdQueryHandler } from './application/queries/users/GetUserByIdQueryHandler';
import { CreateUserCommandHandler } from './application/commands/users/CreateUserCommandHandler';
import { UpdateUserCommandHandler } from './application/commands/users/UpdateUserCommandHandler';
import { DeleteUserCommandHandler } from './application/commands/users/DeleteUserCommandHandler';
import { CreateCollectionCommandHandler } from './application/commands/collections/CreateCollectionCommandHandler';
import { UpdateCollectionCommandHandler } from './application/commands/collections/UpdateCollectionCommandHandler';
import { DeleteCollectionCommandHandler } from './application/commands/collections/DeleteCollectionCommandHandler';
import { AssociateDataSourceToCollectionCommandHandler } from './application/commands/collections/AssociateDataSourceToCollectionCommandHandler';
import { DisassociateDataSourceFromCollectionCommandHandler } from './application/commands/collections/DisassociateDataSourceFromCollectionCommandHandler';
import { GetAllCollectionsQueryHandler } from './application/queries/collections/GetAllCollectionsQueryHandler';
import { GetCollectionQueryHandler } from './application/queries/collections/GetCollectionQueryHandler';
import { GetCollectionDetailsQueryHandler } from './application/queries/collections/GetCollectionDetailsQueryHandler';
import { GetCollectionDataSourcesQueryHandler } from './application/queries/collections/GetCollectionDataSourcesQueryHandler';
import { CreateDataSourceCommandHandler } from './application/commands/datasources/CreateDataSourceCommandHandler';
import { GetAllDataSourcesQueryHandler } from './application/queries/datasources/GetAllDataSourcesQueryHandler';
import { GetDataSourceQueryHandler } from './application/queries/datasources/GetDataSourceQueryHandler';
import { ExtractSchemaCommandHandler } from './application/commands/datasources/ExtractSchemaCommandHandler';
import { GetDataSourceSchemaQueryHandler } from './application/queries/datasources/GetDataSourceSchemaQueryHandler';
import { UpdateSchemaMetadataCommandHandler } from './application/commands/datasources/UpdateSchemaMetadataCommandHandler';
import { GetSchemaSnapshotsQueryHandler } from './application/queries/datasources/GetSchemaSnapshotsQueryHandler';
import { SchemaSnapshotRepository } from './infrastructure/repositories/SchemaSnapshotRepository';
import { SchemaComparisonService } from './infrastructure/services/SchemaComparisonService';
import { SchemaRescanSchedulerService } from './infrastructure/services/SchemaRescanSchedulerService';
import { SchemaExtractionService } from './infrastructure/services/SchemaExtractionService';
import { RelationshipRepository } from './infrastructure/repositories/RelationshipRepository';
import { RelationshipDiscoveryService } from './infrastructure/services/RelationshipDiscoveryService';
import { DiscoverRelationshipsCommandHandler } from './application/commands/collections/DiscoverRelationshipsCommandHandler';
import { GetCollectionRelationshipsQueryHandler } from './application/queries/collections/GetCollectionRelationshipsQueryHandler';
import { CreateRelationshipCommandHandler } from './application/commands/collections/CreateRelationshipCommandHandler';
import { UpdateRelationshipCommandHandler } from './application/commands/collections/UpdateRelationshipCommandHandler';
import { DeleteRelationshipCommandHandler } from './application/commands/collections/DeleteRelationshipCommandHandler';

const app = express();
const logger = createLogger();
const PORT = Number(process.env.PORT) || 5000;

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connection established');
    logger.info(`Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);

    // Middleware
    // Configuração do Helmet para não bloquear requisições do frontend
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration - permite requisições do frontend
    // IMPORTANTE: Quando credentials: true, não pode usar origin: '*'
    // Em desenvolvimento, permite localhost em diferentes portas
    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Permite requisições sem origin (ex: Postman, mobile apps)
        if (!origin) {
          return callback(null, true);
        }
        // Em desenvolvimento, permite qualquer localhost
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
          return callback(null, true);
        }
        // Verifica se a origin está na lista permitida
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Content-Type', 'Authorization'],
    };
    app.use(cors(corsOptions));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(requestLoggingMiddleware(logger));

    // Dependency Injection - Repositories
    const userRepository = new UserRepository();
    const collectionRepository = new CollectionRepository();
    const dataSourceRepository = new DataSourceRepository();

    // Dependency Injection - Services
    const passwordHasher = new PasswordHasherService();
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured. Set ENCRYPTION_KEY environment variable.');
    }
    const encryptionService = new EncryptionService(encryptionKey);

    // Dependency Injection - Handlers
    const loginHandler = new LoginCommandHandler(userRepository, passwordHasher, logger);
    const getCurrentUserHandler = new GetCurrentUserQueryHandler(userRepository);
    const getAllUsersHandler = new GetAllUsersQueryHandler(userRepository);
    const getUserByIdHandler = new GetUserByIdQueryHandler(userRepository);
    const createUserHandler = new CreateUserCommandHandler(userRepository, passwordHasher);
    const updateUserHandler = new UpdateUserCommandHandler(userRepository, passwordHasher);
    const deleteUserHandler = new DeleteUserCommandHandler(userRepository);

    // Dependency Injection - Collection Handlers
    const getAllCollectionsHandler = new GetAllCollectionsQueryHandler(collectionRepository);
    const getCollectionHandler = new GetCollectionQueryHandler(collectionRepository);
    const getCollectionDetailsHandler = new GetCollectionDetailsQueryHandler(collectionRepository);
    const createCollectionHandler = new CreateCollectionCommandHandler(collectionRepository);
    const updateCollectionHandler = new UpdateCollectionCommandHandler(collectionRepository);
    const deleteCollectionHandler = new DeleteCollectionCommandHandler(collectionRepository);
    const associateDataSourceHandler = new AssociateDataSourceToCollectionCommandHandler(
      dataSourceRepository,
      collectionRepository
    );
    const disassociateDataSourceHandler = new DisassociateDataSourceFromCollectionCommandHandler(
      dataSourceRepository,
      collectionRepository
    );
    const getCollectionDataSourcesHandler = new GetCollectionDataSourcesQueryHandler(
      dataSourceRepository,
      collectionRepository
    );

    // Dependency Injection - Schema Services
    const schemaSnapshotRepository = new SchemaSnapshotRepository();
    const schemaExtractionService = new SchemaExtractionService();

    // Dependency Injection - Relationship Services
    const relationshipRepository = new RelationshipRepository();
    const relationshipDiscoveryService = new RelationshipDiscoveryService(
      dataSourceRepository,
      schemaSnapshotRepository
    );
    const discoverRelationshipsHandler = new DiscoverRelationshipsCommandHandler(
      collectionRepository,
      relationshipRepository,
      relationshipDiscoveryService
    );
    const getCollectionRelationshipsHandler = new GetCollectionRelationshipsQueryHandler(
      collectionRepository,
      relationshipRepository
    );
    const createRelationshipHandler = new CreateRelationshipCommandHandler(
      collectionRepository,
      relationshipRepository
    );
    const updateRelationshipHandler = new UpdateRelationshipCommandHandler(
      collectionRepository,
      relationshipRepository
    );
    const deleteRelationshipHandler = new DeleteRelationshipCommandHandler(
      collectionRepository,
      relationshipRepository
    );

    // Dependency Injection - DataSource Handlers
    const createDataSourceHandler = new CreateDataSourceCommandHandler(
      dataSourceRepository,
      collectionRepository,
      schemaExtractionService,
      schemaSnapshotRepository,
      encryptionService
    );
    const getAllDataSourcesHandler = new GetAllDataSourcesQueryHandler(
      dataSourceRepository,
      collectionRepository
    );
    const getDataSourceHandler = new GetDataSourceQueryHandler(
      dataSourceRepository,
      collectionRepository
    );
    const extractSchemaHandler = new ExtractSchemaCommandHandler(
      dataSourceRepository,
      schemaSnapshotRepository,
      collectionRepository,
      schemaExtractionService,
      encryptionService
    );
    const getSchemaHandler = new GetDataSourceSchemaQueryHandler(
      dataSourceRepository,
      schemaSnapshotRepository,
      collectionRepository
    );
    const updateSchemaMetadataHandler = new UpdateSchemaMetadataCommandHandler(
      dataSourceRepository,
      schemaSnapshotRepository,
      collectionRepository
    );
    const getSnapshotsHandler = new GetSchemaSnapshotsQueryHandler(
      dataSourceRepository,
      schemaSnapshotRepository,
      collectionRepository
    );

    // Dependency Injection - Services
    const schemaComparisonService = new SchemaComparisonService();
    const rescanSchedulerService = new SchemaRescanSchedulerService(
      extractSchemaHandler
    );

    // Dependency Injection - Controllers
    const authController = new AuthController(loginHandler, getCurrentUserHandler);
    const usersController = new UsersController(
      getAllUsersHandler,
      getUserByIdHandler,
      createUserHandler,
      updateUserHandler,
      deleteUserHandler
    );
    const collectionsController = new CollectionsController(
      getAllCollectionsHandler,
      getCollectionHandler,
      getCollectionDetailsHandler,
      createCollectionHandler,
      updateCollectionHandler,
      deleteCollectionHandler,
      associateDataSourceHandler,
      disassociateDataSourceHandler,
      getCollectionDataSourcesHandler,
      discoverRelationshipsHandler,
      getCollectionRelationshipsHandler,
      createRelationshipHandler,
      updateRelationshipHandler,
      deleteRelationshipHandler
    );
    const dataSourcesController = new DataSourcesController(
      createDataSourceHandler,
      getAllDataSourcesHandler,
      getDataSourceHandler,
      extractSchemaHandler,
      getSchemaHandler,
      updateSchemaMetadataHandler,
      getSnapshotsHandler,
      schemaSnapshotRepository,
      schemaComparisonService,
      rescanSchedulerService,
      encryptionService
    );
    const queryController = new QueryController();

    // Routes
    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api/users', createUserRoutes(usersController));
    app.use('/api/collections', createCollectionRoutes(collectionsController));
    app.use('/api/data-sources', createDataSourceRoutes(dataSourcesController));
    app.use('/api/models', modelsRoutes);
    app.post('/api/queries/execute', (req, res) => queryController.execute(req, res));

    // Health check
    app.get('/health', (_, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Error handling middleware (must be last)
    app.use(errorHandlerMiddleware(logger));

    // Start server
    const HOST = process.env.HOST || '0.0.0.0'; // Escuta em todas as interfaces de rede
    app.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Accessible from: http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      rescanSchedulerService.stopAll();
      await AppDataSource.destroy();
      logger.info('Database connection closed');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((error) => {
    logger.error('Error during database initialization:', {
      code: error.code,
      service: error.service,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Log detalhes da conexão (sem senha)
    logger.error('Connection details:', {
      host: process.env.DB_HOST || 'NOT SET',
      port: process.env.DB_PORT || 'NOT SET',
      username: process.env.DB_USERNAME || 'NOT SET',
      database: process.env.DB_DATABASE || 'NOT SET',
      password: process.env.DB_PASSWORD ? '***SET***' : 'NOT SET',
    });

    logger.error('Please check:');
    logger.error('1. Database credentials in .env file');
    logger.error('2. Database server is running and accessible');
    logger.error('3. Network connectivity to database host');
    logger.error('4. SSL configuration (if using Supabase)');

    process.exit(1);
  });

