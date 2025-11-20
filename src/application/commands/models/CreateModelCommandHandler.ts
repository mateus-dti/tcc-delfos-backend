import { CreateModelCommand, ICreateModelCommandHandler } from './CreateModelCommand';
import { ModelDto } from '../../dto/responses/ModelDto';
import { ModelRepository } from '../../../infrastructure/repositories/ModelRepository';
import { Model, ModelOrigin } from '../../../domain/entities/Model';
import { createLogger } from '../../../infrastructure/config/logger';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '../../../domain/exceptions/ConflictException';

/**
 * Handler para criar novo modelo
 * RF04.1 - Cadastrar Modelo de IA
 */
export class CreateModelCommandHandler implements ICreateModelCommandHandler {
  private logger = createLogger();

  constructor(private modelRepository: ModelRepository) {}

  async handle(command: CreateModelCommand): Promise<ModelDto> {
    try {
      this.logger.info('Criando novo modelo', { identifier: command.identifier });

      // Verificar se já existe modelo com mesmo identifier
      const exists = await this.modelRepository.existsByIdentifier(command.identifier);
      if (exists) {
        throw new ConflictException(
          `Já existe um modelo com o identifier '${command.identifier}'`
        );
      }

      // Criar entidade
      const model = new Model();
      model.id = uuidv4();
      model.name = command.name;
      model.identifier = command.identifier;
      model.description = command.description;
      model.origin = command.origin === 'OpenRouter' ? ModelOrigin.OpenRouter : ModelOrigin.Internal;
      model.isActive = true;

      // Salvar no banco
      const savedModel = await this.modelRepository.create(model);

      this.logger.info(`Modelo criado com sucesso: ${savedModel.id}`);

      // Retornar DTO
      return {
        id: savedModel.id,
        name: savedModel.name,
        identifier: savedModel.identifier,
        description: savedModel.description,
        origin: savedModel.origin as 'OpenRouter' | 'Internal',
        isActive: savedModel.isActive,
        createdAt: savedModel.createdAt,
        updatedAt: savedModel.updatedAt,
      };
    } catch (error) {
      this.logger.error('Erro ao criar modelo:', error);
      throw error;
    }
  }
}
