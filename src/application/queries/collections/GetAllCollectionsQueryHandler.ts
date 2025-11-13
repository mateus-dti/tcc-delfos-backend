import { GetAllCollectionsQuery, IGetAllCollectionsQueryHandler } from './GetAllCollectionsQuery';
import { CollectionDto } from '../../dto/responses/CollectionDto';
import { Collection } from '../../../domain/entities/Collection';
import { ICollectionRepository, PagedResult } from '../../../domain/interfaces/ICollectionRepository';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class GetAllCollectionsQueryHandler implements IGetAllCollectionsQueryHandler {
  constructor(private collectionRepository: ICollectionRepository) {}

  async handle(query: GetAllCollectionsQuery): Promise<PagedResult<CollectionDto>> {
    try {
      const filters = {
        ownerId: query.ownerId,
        search: query.search,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
        page: query.page || 1,
        pageSize: query.pageSize || 10,
      };

      const result = await this.collectionRepository.search(filters);

      // Contar fontes de dados para cada coleção
      const itemsWithCounts = await Promise.all(
        result.items.map(async (collection) => {
          const count = await this.collectionRepository.countDataSources(collection.id);
          return this.mapToCollectionDto(collection, count);
        })
      );

      return {
        ...result,
        items: itemsWithCounts,
      };
    } catch (error) {
      throw new DatabaseException(
        'Erro ao listar coleções. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToCollectionDto(collection: Collection, dataSourcesCount?: number): CollectionDto {
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
      dataSourcesCount: dataSourcesCount,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }
}

