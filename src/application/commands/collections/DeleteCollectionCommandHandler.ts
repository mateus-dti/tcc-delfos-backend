import { DeleteCollectionCommand, IDeleteCollectionCommandHandler } from './DeleteCollectionCommand';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class DeleteCollectionCommandHandler implements IDeleteCollectionCommandHandler {
  constructor(private collectionRepository: ICollectionRepository) {}

  async handle(command: DeleteCollectionCommand): Promise<boolean> {
    try {
      const collection = await this.collectionRepository.getById(command.id);

      if (!collection) {
        throw new NotFoundException('Coleção', command.id);
      }

      // Check if user is the owner
      if (collection.ownerId !== command.ownerId) {
        throw new ForbiddenException('Você só pode excluir suas próprias coleções.');
      }

      // TODO: Add validation for dependencies (e.g., check if collection has data sources)
      // For now, we'll just soft delete

      const deleted = await this.collectionRepository.delete(command.id);
      
      if (!deleted) {
        throw new DatabaseException('Erro ao excluir coleção. Tente novamente.');
      }

      return deleted;
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof DatabaseException
      ) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao excluir coleção. Por favor, tente novamente.',
        error
      );
    }
  }
}

