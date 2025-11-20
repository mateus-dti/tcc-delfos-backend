import { UpdateModelCommand, IUpdateModelCommandHandler } from './UpdateModelCommand';
import { ModelDto } from '../../dto/responses/ModelDto';
import { ModelRepository } from '../../../infrastructure/repositories/ModelRepository';
import { createLogger } from '../../../infrastructure/config/logger';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';

/**
 * Handler para atualizar modelo existente
 * RF04.1 - Atualizar Modelo de IA
 */
export class UpdateModelCommandHandler implements IUpdateModelCommandHandler {
  private logger = createLogger();

  constructor(private modelRepository: ModelRepository) {}

  async handle(command: UpdateModelCommand): Promise<ModelDto> {
    try {
      this.logger.info('Atualizando modelo', { id: command.id });

      // Buscar modelo existente
      const model = await this.modelRepository.getById(command.id);
      if (!model) {
        throw new NotFoundException(`Modelo com ID ${command.id} não encontrado`);
      }

      // Atualizar campos
      if (command.name !== undefined) {
        model.name = command.name;
      }
      if (command.description !== undefined) {
        model.description = command.description;
      }
      if (command.isActive !== undefined) {
        model.isActive = command.isActive;
      }

      // Salvar no banco
      const updatedModel = await this.modelRepository.update(model);

      this.logger.info(`Modelo atualizado com sucesso: ${updatedModel.id}`);

      // Retornar DTO
      return {
        id: updatedModel.id,
        name: updatedModel.name,
        identifier: updatedModel.identifier,
        description: updatedModel.description,
        origin: updatedModel.origin as 'OpenRouter' | 'Internal',
        isActive: updatedModel.isActive,
        createdAt: updatedModel.createdAt,
        updatedAt: updatedModel.updatedAt,
      };
    } catch (error) {
      this.logger.error('Erro ao atualizar modelo:', error);
      throw error;
    }
  }
}
