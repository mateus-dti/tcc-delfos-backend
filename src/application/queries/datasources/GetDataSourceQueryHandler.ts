import { GetDataSourceQuery, IGetDataSourceQueryHandler } from './GetDataSourceQuery';
import { DataSourceDto } from '../../dto/responses/DataSourceDto';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class GetDataSourceQueryHandler implements IGetDataSourceQueryHandler {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private collectionRepository: ICollectionRepository
  ) {}

  async handle(query: GetDataSourceQuery): Promise<DataSourceDto> {
    try {
      const dataSource = await this.dataSourceRepository.getById(query.id);
      if (!dataSource) {
        throw new NotFoundException('Fonte de dados', query.id);
      }

      // Verificar se o usuário é o dono da coleção
      const collection = await this.collectionRepository.getById(dataSource.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', dataSource.collectionId);
      }

      if (collection.ownerId !== query.ownerId) {
        throw new ForbiddenException(
          'Você não tem permissão para visualizar esta fonte de dados.'
        );
      }

      return this.mapToDataSourceDto(dataSource);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new DatabaseException('Erro ao obter fonte de dados. Por favor, tente novamente.', error);
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

