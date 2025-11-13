import {
  GetCollectionDataSourcesQuery,
  IGetCollectionDataSourcesQueryHandler,
} from './GetCollectionDataSourcesQuery';
import { DataSourceDto } from '../../dto/responses/DataSourceDto';
import { DataSource } from '../../../domain/entities/DataSource';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';

export class GetCollectionDataSourcesQueryHandler implements IGetCollectionDataSourcesQueryHandler {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private collectionRepository: ICollectionRepository
  ) {}

  async handle(query: GetCollectionDataSourcesQuery): Promise<DataSourceDto[]> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(query.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', query.collectionId);
      }

      // Verificar se o usuário tem acesso à coleção (dono ou tem acesso via CollectionAccess)
      // Por enquanto, apenas verificamos se é o dono
      // TODO: Adicionar verificação de CollectionAccess quando necessário
      if (collection.ownerId !== query.userId) {
        throw new UnauthorizedException(
          'Você não tem permissão para visualizar as fontes de dados desta coleção.'
        );
      }

      const dataSources = await this.dataSourceRepository.getByCollectionId(query.collectionId);
      return dataSources.map((ds) => this.mapToDataSourceDto(ds));
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao buscar fontes de dados da coleção. Por favor, tente novamente.',
        error
      );
    }
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

