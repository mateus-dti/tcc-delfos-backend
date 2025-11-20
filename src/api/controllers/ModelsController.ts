import { Request, Response, NextFunction } from 'express';
import { GetModelsQuery } from '../../application/queries/models/GetPublicModelsQuery';
import { GetModelsQueryHandler } from '../../application/queries/models/GetPublicModelsQueryHandler';
import { CreateModelCommand } from '../../application/commands/models/CreateModelCommand';
import { CreateModelCommandHandler } from '../../application/commands/models/CreateModelCommandHandler';
import { UpdateModelCommand } from '../../application/commands/models/UpdateModelCommand';
import { UpdateModelCommandHandler } from '../../application/commands/models/UpdateModelCommandHandler';
import { DeleteModelCommand } from '../../application/commands/models/DeleteModelCommand';
import { DeleteModelCommandHandler } from '../../application/commands/models/DeleteModelCommandHandler';
import { ModelRepository } from '../../infrastructure/repositories/ModelRepository';
import { createLogger } from '../../infrastructure/config/logger';
import { CreateModelRequestDto, UpdateModelRequestDto } from '../../application/dto/requests/ModelRequestDto';

/**
 * Controller para endpoints relacionados a modelos de IA
 * RF04.1 - CRUD de Modelos de IA
 */
export class ModelsController {
  private logger = createLogger();
  private getModelsHandler: GetModelsQueryHandler;
  private createModelHandler: CreateModelCommandHandler;
  private updateModelHandler: UpdateModelCommandHandler;
  private deleteModelHandler: DeleteModelCommandHandler;

  constructor() {
    const modelRepository = new ModelRepository();
    this.getModelsHandler = new GetModelsQueryHandler(modelRepository);
    this.createModelHandler = new CreateModelCommandHandler(modelRepository);
    this.updateModelHandler = new UpdateModelCommandHandler(modelRepository);
    this.deleteModelHandler = new DeleteModelCommandHandler(modelRepository);
  }

  /**
   * GET /api/models
   * Lista todos os modelos disponíveis
   * 
   * Query params:
   * - origin: 'OpenRouter' | 'Internal' - Filtra por origem
   * - search: string - Busca por nome, identifier ou descrição
   */
  async getModels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.logger.info('GET /api/models', {
        query: req.query,
      });

      const query = new GetModelsQuery();
      query.origin = req.query.origin as 'OpenRouter' | 'Internal' | undefined;
      query.search = req.query.search as string | undefined;

      const result = await this.getModelsHandler.handle(query);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/models
   * Cria um novo modelo
   */
  async createModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.logger.info('POST /api/models', { body: req.body });

      const requestDto: CreateModelRequestDto = req.body;

      const command = new CreateModelCommand();
      command.name = requestDto.name;
      command.identifier = requestDto.identifier;
      command.description = requestDto.description;
      command.origin = requestDto.origin;

      const result = await this.createModelHandler.handle(command);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/models/:id
   * Atualiza um modelo existente
   */
  async updateModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.logger.info(`PUT /api/models/${id}`, { body: req.body });

      const requestDto: UpdateModelRequestDto = req.body;

      const command = new UpdateModelCommand();
      command.id = id;
      command.name = requestDto.name;
      command.description = requestDto.description;
      command.isActive = requestDto.isActive;

      const result = await this.updateModelHandler.handle(command);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/models/:id
   * Deleta um modelo (soft delete)
   */
  async deleteModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.logger.info(`DELETE /api/models/${id}`);

      const command = new DeleteModelCommand();
      command.id = id;

      await this.deleteModelHandler.handle(command);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
