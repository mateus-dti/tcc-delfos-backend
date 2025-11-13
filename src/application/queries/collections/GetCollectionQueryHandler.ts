import { GetCollectionQuery, IGetCollectionQueryHandler } from './GetCollectionQuery';
import { CollectionDto } from '../../dto/responses/CollectionDto';
import { Collection } from '../../../domain/entities/Collection';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class GetCollectionQueryHandler implements IGetCollectionQueryHandler {
  constructor(private collectionRepository: ICollectionRepository) {}

  async handle(query: GetCollectionQuery): Promise<CollectionDto | null> {
    try {
      const collection = await this.collectionRepository.getById(query.id);
      if (!collection) {
        return null;
      }
      return this.mapToCollectionDto(collection);
    } catch (error) {
      throw new DatabaseException(
        'Erro ao buscar coleção. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToCollectionDto(collection: Collection): CollectionDto {
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      ownerId: collection.ownerId,
      owner: collection.owner
        ? {
            id: collection.owner.id,
            username: collection.owner.username,
            email: collection.owner.email,
          }
        : undefined,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }
}

