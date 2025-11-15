import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateDataSourceRequest } from '../../application/dto/requests/CreateDataSourceRequest';
import { CreateDataSourceCommand, ICreateDataSourceCommandHandler } from '../../application/commands/datasources/CreateDataSourceCommand';
import { GetAllDataSourcesQuery, IGetAllDataSourcesQueryHandler } from '../../application/queries/datasources/GetAllDataSourcesQuery';
import { GetDataSourceQuery, IGetDataSourceQueryHandler } from '../../application/queries/datasources/GetDataSourceQuery';
import { ExtractSchemaCommand, IExtractSchemaCommandHandler } from '../../application/commands/datasources/ExtractSchemaCommand';
import { GetDataSourceSchemaQuery, IGetDataSourceSchemaQueryHandler } from '../../application/queries/datasources/GetDataSourceSchemaQuery';
import { UpdateSchemaMetadataCommand, IUpdateSchemaMetadataCommandHandler } from '../../application/commands/datasources/UpdateSchemaMetadataCommand';
import { UpdateSchemaMetadataRequest } from '../../application/dto/requests/UpdateSchemaMetadataRequest';
import { GetSchemaSnapshotsQuery, IGetSchemaSnapshotsQueryHandler } from '../../application/queries/datasources/GetSchemaSnapshotsQuery';
import { AuthRequest } from '../middleware/authMiddleware';
import { ValidationException } from '../../domain/exceptions/ValidationException';
import { IEncryptionService } from '../../domain/interfaces/IEncryptionService';
import { SchemaComparisonService } from '../../infrastructure/services/SchemaComparisonService';
import { ISchemaSnapshotRepository } from '../../domain/interfaces/ISchemaSnapshotRepository';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { SchemaComparisonDto } from '../../application/dto/responses/SchemaComparisonDto';
import { SchemaRescanSchedulerService } from '../../infrastructure/services/SchemaRescanSchedulerService';
import { CreateRescanScheduleRequest } from '../../application/dto/requests/CreateRescanScheduleRequest';
import { randomUUID } from 'crypto';

export class DataSourcesController {
  constructor(
    private createDataSourceHandler: ICreateDataSourceCommandHandler,
    private getAllDataSourcesHandler: IGetAllDataSourcesQueryHandler,
    private getDataSourceHandler: IGetDataSourceQueryHandler,
    private extractSchemaHandler: IExtractSchemaCommandHandler,
    private getSchemaHandler: IGetDataSourceSchemaQueryHandler,
    private updateSchemaMetadataHandler: IUpdateSchemaMetadataCommandHandler,
    private getSnapshotsHandler: IGetSchemaSnapshotsQueryHandler,
    private schemaSnapshotRepository: ISchemaSnapshotRepository,
    private schemaComparisonService: SchemaComparisonService,
    private rescanSchedulerService: SchemaRescanSchedulerService,
    private encryptionService: IEncryptionService
  ) {}

  async createDataSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para criar fontes de dados.');
      }

      const createRequest = plainToInstance(CreateDataSourceRequest, req.body);
      const errors = await validate(createRequest);

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

      // Criptografar a URI de conexão
      const connectionUriEncrypted = this.encryptionService.encrypt(createRequest.connectionUri);

      const command: CreateDataSourceCommand = {
        name: createRequest.name,
        collectionId: createRequest.collectionId,
        type: createRequest.type,
        connectionUri: createRequest.connectionUri,
        connectionUriEncrypted: connectionUriEncrypted,
        metadata: createRequest.metadata,
        ownerId: ownerId,
      };

      const result = await this.createDataSourceHandler.handle(command);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllDataSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para listar fontes de dados.');
      }

      const collectionId = req.query.collectionId as string | undefined;

      const query: GetAllDataSourcesQuery = {
        ownerId: ownerId,
        collectionId: collectionId,
      };

      const result = await this.getAllDataSourcesHandler.handle(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDataSourceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para visualizar fontes de dados.');
      }

      const query: GetDataSourceQuery = {
        id: id,
        ownerId: ownerId,
      };

      const result = await this.getDataSourceHandler.handle(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async extractSchema(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para extrair schema.');
      }

      const command: ExtractSchemaCommand = {
        dataSourceId: id,
        ownerId: ownerId,
      };

      const result = await this.extractSchemaHandler.handle(command);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSchema(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para visualizar schema.');
      }

      const version = req.query.version ? parseInt(req.query.version as string) : undefined;

      const query: GetDataSourceSchemaQuery = {
        dataSourceId: id,
        ownerId: ownerId,
        version: version,
      };

      const result = await this.getSchemaHandler.handle(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateSchemaMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para editar metadados do schema.');
      }

      const updateRequest = plainToInstance(UpdateSchemaMetadataRequest, req.body);
      const errors = await validate(updateRequest);

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

      const command: UpdateSchemaMetadataCommand = {
        dataSourceId: id,
        metadata: updateRequest.metadata || {},
        ownerId: ownerId,
      };

      const result = await this.updateSchemaMetadataHandler.handle(command);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async rescanSchema(req: Request, res: Response, next: NextFunction): Promise<void> {
    // RescanSchema é um alias do extractSchema
    // Mantém compatibilidade com a API especificada na tarefa
    return this.extractSchema(req, res, next);
  }

  async getSnapshots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para visualizar snapshots.');
      }

      const query: GetSchemaSnapshotsQuery = {
        dataSourceId: id,
        ownerId: ownerId,
      };

      const result = await this.getSnapshotsHandler.handle(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async compareSnapshots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { oldSnapshotId, newSnapshotId } = req.query;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para comparar snapshots.');
      }

      if (!oldSnapshotId || !newSnapshotId) {
        throw new ValidationException('Os parâmetros oldSnapshotId e newSnapshotId são obrigatórios.');
      }

      // Buscar snapshots
      const oldSnapshot = await this.schemaSnapshotRepository.getById(oldSnapshotId as string);
      const newSnapshot = await this.schemaSnapshotRepository.getById(newSnapshotId as string);

      if (!oldSnapshot) {
        throw new NotFoundException('Snapshot', oldSnapshotId as string);
      }

      if (!newSnapshot) {
        throw new NotFoundException('Snapshot', newSnapshotId as string);
      }

      // Verificar se ambos pertencem à mesma fonte de dados
      if (oldSnapshot.dataSourceId !== id || newSnapshot.dataSourceId !== id) {
        throw new ValidationException('Os snapshots devem pertencer à mesma fonte de dados.');
      }

      // Comparar snapshots
      const comparison = this.schemaComparisonService.compareSnapshots(oldSnapshot, newSnapshot);

      const result: SchemaComparisonDto = {
        hasChanges: comparison.hasChanges,
        differences: comparison.differences,
        addedTables: comparison.addedTables,
        removedTables: comparison.removedTables,
        modifiedTables: comparison.modifiedTables,
        oldSnapshotId: oldSnapshot.id,
        newSnapshotId: newSnapshot.id,
        oldVersion: oldSnapshot.version,
        newVersion: newSnapshot.version,
      };

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createRescanSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para criar agendamentos.');
      }

      const scheduleRequest = plainToInstance(CreateRescanScheduleRequest, req.body);
      const errors = await validate(scheduleRequest);

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

      // Usar o ID da URL como dataSourceId
      scheduleRequest.dataSourceId = id;

      // Verificar se a fonte de dados existe e pertence ao usuário
      const dataSource = await this.getDataSourceHandler.handle({
        id: id,
        ownerId: ownerId,
      });

      if (!dataSource) {
        throw new NotFoundException('Fonte de dados', id);
      }

      // Criar agendamento
      const scheduleId = randomUUID();
      const schedule = {
        id: scheduleId,
        dataSourceId: id,
        ownerId: ownerId,
        cronExpression: scheduleRequest.cronExpression,
        enabled: scheduleRequest.enabled ?? true,
        description: scheduleRequest.description,
      };

      this.rescanSchedulerService.scheduleRescan(schedule);

      res.status(201).json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async getRescanSchedules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para visualizar agendamentos.');
      }

      // Verificar se a fonte de dados existe e pertence ao usuário
      await this.getDataSourceHandler.handle({
        id: id,
        ownerId: ownerId,
      });

      const schedules = this.rescanSchedulerService.getSchedulesByDataSource(id);
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  }

  async deleteRescanSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, scheduleId } = req.params;
      const authReq = req as AuthRequest;
      const ownerId = authReq.user?.sub;

      if (!ownerId) {
        throw new ValidationException('Você precisa estar autenticado para remover agendamentos.');
      }

      // Verificar se o agendamento existe e pertence à fonte de dados do usuário
      const schedule = this.rescanSchedulerService.getSchedule(scheduleId);
      if (!schedule) {
        throw new NotFoundException('Agendamento', scheduleId);
      }

      if (schedule.dataSourceId !== id) {
        throw new ValidationException('O agendamento não pertence a esta fonte de dados.');
      }

      // Verificar se a fonte de dados pertence ao usuário
      await this.getDataSourceHandler.handle({
        id: id,
        ownerId: ownerId,
      });

      this.rescanSchedulerService.unscheduleRescan(scheduleId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

