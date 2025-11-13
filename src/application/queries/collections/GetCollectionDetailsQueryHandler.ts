import {
  GetCollectionDetailsQuery,
  IGetCollectionDetailsQueryHandler,
} from './GetCollectionDetailsQuery';
import { CollectionDetailsDto } from '../../dto/responses/CollectionDto';
import { Collection } from '../../../domain/entities/Collection';
import { DataSource } from '../../../domain/entities/DataSource';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { DataSourceDto } from '../../dto/responses/DataSourceDto';

export class GetCollectionDetailsQueryHandler implements IGetCollectionDetailsQueryHandler {
  constructor(private collectionRepository: ICollectionRepository) {}

  async handle(query: GetCollectionDetailsQuery): Promise<CollectionDetailsDto | null> {
    try {
      const collection = await this.collectionRepository.getByIdWithDataSources(query.id);
      if (!collection) {
        return null;
      }

      // Verificar se o usuário tem acesso à coleção (dono ou tem acesso via CollectionAccess)
      // Por enquanto, apenas verificamos se é o dono
      // TODO: Adicionar verificação de CollectionAccess quando necessário
      if (collection.ownerId !== query.userId) {
        throw new UnauthorizedException(
          'Você não tem permissão para visualizar os detalhes desta coleção.'
        );
      }

      return this.mapToCollectionDetailsDto(collection);
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao buscar detalhes da coleção. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToCollectionDetailsDto(collection: Collection): CollectionDetailsDto {
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
      dataSourcesCount: collection.dataSources?.filter((ds) => ds.isActive).length || 0,
      dataSources: (collection.dataSources || [])
        .filter((ds) => ds.isActive)
        .map((ds) => this.mapToDataSourceDto(ds)),
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }

  private mapToDataSourceDto(dataSource: DataSource): DataSourceDto {
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

