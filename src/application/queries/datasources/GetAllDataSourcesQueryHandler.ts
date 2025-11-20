import { GetAllDataSourcesQuery, IGetAllDataSourcesQueryHandler } from './GetAllDataSourcesQuery';
import { DataSourceDto } from '../../dto/responses/DataSourceDto';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class GetAllDataSourcesQueryHandler implements IGetAllDataSourcesQueryHandler {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private collectionRepository: ICollectionRepository
  ) {}

  async handle(query: GetAllDataSourcesQuery): Promise<{
    items: DataSourceDto[];
    total: number;
  }> {
    try {
      if (query.collectionId) {
        // Verificar se a coleção existe e se o usuário tem acesso
        const collection = await this.collectionRepository.getById(query.collectionId);
        if (!collection) {
          return { items: [], total: 0 };
        }

        // Verificar se o usuário é o dono da coleção
        if (collection.ownerId !== query.ownerId) {
          throw new ForbiddenException(
            'Você não tem permissão para visualizar fontes de dados desta coleção.'
          );
        }

        const dataSources = await this.dataSourceRepository.getByCollectionId(query.collectionId);
        const items = dataSources.map((ds) => this.mapToDataSourceDto(ds));
        return { items, total: items.length };
      }

      // Se não especificou collectionId, retornar todas as fontes de dados das coleções do usuário
      const collections = await this.collectionRepository.getByOwnerId(query.ownerId);
      const allDataSources: DataSourceDto[] = [];

      for (const collection of collections) {
        const dataSources = await this.dataSourceRepository.getByCollectionId(collection.id);
        allDataSources.push(...dataSources.map((ds) => this.mapToDataSourceDto(ds)));
      }

      return { items: allDataSources, total: allDataSources.length };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new DatabaseException('Erro ao listar fontes de dados. Por favor, tente novamente.', error);
    }
  }

  private mapToDataSourceDto(dataSource: import('../../../domain/entities/DataSource').DataSource): DataSourceDto {
    return {
      id: dataSource.id,
      collectionId: dataSource.collectionId,
      name: dataSource.name,
      type: dataSource.type,
      connectionUriEncrypted: dataSource.connectionUriEncrypted,
      metadata: dataSource.metadata,
      lastScannedAt: dataSource.lastScannedAt,
      isActive: dataSource.isActive,
      createdAt: dataSource.createdAt,
      updatedAt: dataSource.updatedAt,
    };
  }
}

