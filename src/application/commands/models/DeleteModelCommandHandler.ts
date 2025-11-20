import { DeleteModelCommand, IDeleteModelCommandHandler } from './DeleteModelCommand';
import { ModelRepository } from '../../../infrastructure/repositories/ModelRepository';
import { createLogger } from '../../../infrastructure/config/logger';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';

/**
 * Handler para deletar modelo (soft delete)
 * RF04.1 - Deletar Modelo de IA
 */
export class DeleteModelCommandHandler implements IDeleteModelCommandHandler {
  private logger = createLogger();

  constructor(private modelRepository: ModelRepository) {}

  async handle(command: DeleteModelCommand): Promise<void> {
    try {
      this.logger.info('Deletando modelo', { id: command.id });

      const deleted = await this.modelRepository.delete(command.id);
      
      if (!deleted) {
        throw new NotFoundException(`Modelo com ID ${command.id} não encontrado`);
      }

      this.logger.info(`Modelo deletado com sucesso: ${command.id}`);
    } catch (error) {
      this.logger.error('Erro ao deletar modelo:', error);
      throw error;
    }
  }
}
