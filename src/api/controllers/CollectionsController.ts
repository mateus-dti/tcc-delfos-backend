import { Request, Response, NextFunction } from 'express';
import { CreateCollectionRequest } from '../../application/dto/requests/CreateCollectionRequest';
import { UpdateCollectionRequest } from '../../application/dto/requests/UpdateCollectionRequest';
import { AssociateDataSourceRequest } from '../../application/dto/requests/AssociateDataSourceRequest';
import { CreateCollectionCommand } from '../../application/commands/collections/CreateCollectionCommand';
import { CreateCollectionCommandHandler } from '../../application/commands/collections/CreateCollectionCommandHandler';
import { UpdateCollectionCommand } from '../../application/commands/collections/UpdateCollectionCommand';
import { UpdateCollectionCommandHandler } from '../../application/commands/collections/UpdateCollectionCommandHandler';
import { DeleteCollectionCommand } from '../../application/commands/collections/DeleteCollectionCommand';
import { DeleteCollectionCommandHandler } from '../../application/commands/collections/DeleteCollectionCommandHandler';
import { AssociateDataSourceToCollectionCommand } from '../../application/commands/collections/AssociateDataSourceToCollectionCommand';
import { AssociateDataSourceToCollectionCommandHandler } from '../../application/commands/collections/AssociateDataSourceToCollectionCommandHandler';
import { DisassociateDataSourceFromCollectionCommand } from '../../application/commands/collections/DisassociateDataSourceFromCollectionCommand';
import { DisassociateDataSourceFromCollectionCommandHandler } from '../../application/commands/collections/DisassociateDataSourceFromCollectionCommandHandler';
import { GetAllCollectionsQuery } from '../../application/queries/collections/GetAllCollectionsQuery';
import { GetAllCollectionsQueryHandler } from '../../application/queries/collections/GetAllCollectionsQueryHandler';
import { GetCollectionQuery } from '../../application/queries/collections/GetCollectionQuery';
import { GetCollectionQueryHandler } from '../../application/queries/collections/GetCollectionQueryHandler';
import { GetCollectionDetailsQuery } from '../../application/queries/collections/GetCollectionDetailsQuery';
import { GetCollectionDetailsQueryHandler } from '../../application/queries/collections/GetCollectionDetailsQueryHandler';
import { GetCollectionDataSourcesQuery } from '../../application/queries/collections/GetCollectionDataSourcesQuery';
import { GetCollectionDataSourcesQueryHandler } from '../../application/queries/collections/GetCollectionDataSourcesQueryHandler';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AuthRequest } from '../middleware/authMiddleware';
import { ValidationException } from '../../domain/exceptions/ValidationException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export class CollectionsController {
  constructor(
    private getAllCollectionsHandler: GetAllCollectionsQueryHandler,
    private getCollectionHandler: GetCollectionQueryHandler,
    private getCollectionDetailsHandler: GetCollectionDetailsQueryHandler,
    private createCollectionHandler: CreateCollectionCommandHandler,
    private updateCollectionHandler: UpdateCollectionCommandHandler,
    private deleteCollectionHandler: DeleteCollectionCommandHandler,
    private associateDataSourceHandler: AssociateDataSourceToCollectionCommandHandler,
    private disassociateDataSourceHandler: DisassociateDataSourceFromCollectionCommandHandler,
    private getCollectionDataSourcesHandler: GetCollectionDataSourcesQueryHandler
  ) {}

  async getAllCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      // Parse query parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined;
      const search = req.query.search as string | undefined;
      const orderBy = req.query.orderBy as 'name' | 'createdAt' | undefined;
      const orderDirection = req.query.orderDirection as 'ASC' | 'DESC' | undefined;

      const query: GetAllCollectionsQuery = {
        ownerId: ownerId,
        search: search,
        orderBy: orderBy,
        orderDirection: orderDirection,
        page: page,
        pageSize: pageSize,
      };
      const result = await this.getAllCollectionsHandler.handle(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCollectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.sub;

      if (!userId) {
        throw new UnauthorizedException('Você precisa estar autenticado para visualizar coleções.');
      }

      // Se incluir query param "details=true", retorna com fontes de dados
      const includeDetails = req.query.details === 'true';

      if (includeDetails) {
        const detailsQuery: GetCollectionDetailsQuery = { id, userId };
        const result = await this.getCollectionDetailsHandler.handle(detailsQuery);

        if (!result) {
          throw new NotFoundException('Coleção', id);
        }

        res.json(result);
      } else {
        const query: GetCollectionQuery = { id };
        const result = await this.getCollectionHandler.handle(query);

        if (!result) {
          throw new NotFoundException('Coleção', id);
        }

        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new UnauthorizedException('Você precisa estar autenticado para criar coleções.');
      }

      const createCollectionRequest = plainToInstance(CreateCollectionRequest, req.body);
      const errors = await validate(createCollectionRequest);

      if (errors.length > 0) {
        const validationErrors = errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        }));
        throw new ValidationException(
          'Os dados fornecidos são inválidos. Por favor, verifique os campos e tente novamente.',
          validationErrors
        );
      }

      const command: CreateCollectionCommand = {
        name: createCollectionRequest.name,
        description: createCollectionRequest.description,
        ownerId: ownerId,
      };

      const result = await this.createCollectionHandler.handle(command);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new UnauthorizedException('Você precisa estar autenticado para atualizar coleções.');
      }

      const updateCollectionRequest = plainToInstance(UpdateCollectionRequest, req.body);
      const errors = await validate(updateCollectionRequest, { skipMissingProperties: true });

      if (errors.length > 0) {
        const validationErrors = errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        }));
        throw new ValidationException(
          'Os dados fornecidos são inválidos. Por favor, verifique os campos e tente novamente.',
          validationErrors
        );
      }

      const command: UpdateCollectionCommand = {
        id,
        name: updateCollectionRequest.name,
        description: updateCollectionRequest.description,
        ownerId: ownerId,
      };

      const result = await this.updateCollectionHandler.handle(command);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new UnauthorizedException('Você precisa estar autenticado para excluir coleções.');
      }

      const command: DeleteCollectionCommand = {
        id,
        ownerId: ownerId,
      };
      const result = await this.deleteCollectionHandler.handle(command);

      if (!result) {
        throw new NotFoundException('Coleção', id);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getCollectionDataSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.sub;

      if (!userId) {
        throw new UnauthorizedException('Você precisa estar autenticado para visualizar fontes de dados.');
      }

      const query: GetCollectionDataSourcesQuery = {
        collectionId: id,
        userId: userId,
      };

      const result = await this.getCollectionDataSourcesHandler.handle(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async associateDataSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new UnauthorizedException('Você precisa estar autenticado para associar fontes de dados.');
      }

      const associateRequest = plainToInstance(AssociateDataSourceRequest, req.body);
      const errors = await validate(associateRequest);

      if (errors.length > 0) {
        const validationErrors = errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        }));
        throw new ValidationException(
          'Os dados fornecidos são inválidos. Por favor, verifique os campos e tente novamente.',
          validationErrors
        );
      }

      const command: AssociateDataSourceToCollectionCommand = {
        collectionId: id,
        name: associateRequest.name,
        type: associateRequest.type,
        connectionUriEncrypted: associateRequest.connectionUriEncrypted,
        metadata: associateRequest.metadata,
        ownerId: ownerId,
      };

      const result = await this.associateDataSourceHandler.handle(command);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async disassociateDataSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, datasourceId } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new UnauthorizedException('Você precisa estar autenticado para desassociar fontes de dados.');
      }

      const command: DisassociateDataSourceFromCollectionCommand = {
        collectionId: id,
        dataSourceId: datasourceId,
        ownerId: ownerId,
      };

      await this.disassociateDataSourceHandler.handle(command);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

