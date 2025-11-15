import { DeleteRelationshipCommand, IDeleteRelationshipCommandHandler } from './DeleteRelationshipCommand';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { IRelationshipRepository } from '../../../domain/interfaces/IRelationshipRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';
import { ValidationException } from '../../../domain/exceptions/ValidationException';

export class DeleteRelationshipCommandHandler implements IDeleteRelationshipCommandHandler {
  constructor(
    private collectionRepository: ICollectionRepository,
    private relationshipRepository: IRelationshipRepository
  ) {}

  async handle(command: DeleteRelationshipCommand): Promise<void> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(command.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', command.collectionId);
      }

      // Verificar se o usuário é o dono da coleção
      if (collection.ownerId !== command.ownerId) {
        throw new ForbiddenException(
          'Você não tem permissão para excluir relacionamentos desta coleção.'
        );
      }

      // Buscar relacionamento
      const relationship = await this.relationshipRepository.getById(command.relationshipId);
      if (!relationship) {
        throw new NotFoundException('Relacionamento', command.relationshipId);
      }

      // Verificar se o relacionamento pertence à coleção
      if (relationship.collectionId !== command.collectionId) {
        throw new ValidationException('O relacionamento não pertence a esta coleção.');
      }

      // Excluir relacionamento
      await this.relationshipRepository.delete(command.relationshipId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao excluir relacionamento. Por favor, tente novamente.',
        error
      );
    }
  }
}

