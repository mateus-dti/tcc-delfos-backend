import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import { AppDataSource } from './infrastructure/data/data-source';
import { createLogger } from './infrastructure/config/logger';
import { requestLoggingMiddleware } from './api/middleware/requestLoggingMiddleware';
import { errorHandlerMiddleware } from './api/middleware/errorHandlerMiddleware';
import { createAuthRoutes } from './api/routes/authRoutes';
import { createUserRoutes } from './api/routes/userRoutes';
import { createCollectionRoutes } from './api/routes/collectionRoutes';
import { AuthController } from './api/controllers/AuthController';
import { UsersController } from './api/controllers/UsersController';
import { CollectionsController } from './api/controllers/CollectionsController';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { CollectionRepository } from './infrastructure/repositories/CollectionRepository';
import { DataSourceRepository } from './infrastructure/repositories/DataSourceRepository';
import { PasswordHasherService } from './infrastructure/services/PasswordHasherService';
//import { EncryptionService } from './infrastructure/services/EncryptionService';
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

// Load environment variables
dotenv.config();

const app = express();
const logger = createLogger();
const PORT = process.env.PORT || 5000;

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connection established');

    // Middleware
    app.use(helmet());
    app.use(cors());
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
    //const encryptionService = new EncryptionService(encryptionKey);

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
      getCollectionDataSourcesHandler
    );

    // Routes
    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api/users', createUserRoutes(usersController));
    app.use('/api/collections', createCollectionRoutes(collectionsController));

    // Health check
    app.get('/health', (_, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Error handling middleware (must be last)
    app.use(errorHandlerMiddleware(logger));

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    logger.error('Error during database initialization:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await AppDataSource.destroy();
  process.exit(0);
});

