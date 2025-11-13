import { randomUUID } from 'crypto';
import {
  AssociateDataSourceToCollectionCommand,
  IAssociateDataSourceToCollectionCommandHandler,
} from './AssociateDataSourceToCollectionCommand';
import { DataSourceDto } from '../../dto/responses/DataSourceDto';
import { DataSource, DataSourceType } from '../../../domain/entities/DataSource';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';

export class AssociateDataSourceToCollectionCommandHandler
  implements IAssociateDataSourceToCollectionCommandHandler
{
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private collectionRepository: ICollectionRepository
  ) {}

  async handle(command: AssociateDataSourceToCollectionCommand): Promise<DataSourceDto> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(command.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', command.collectionId);
      }

      // Verificar se o usuário é o dono da coleção
      if (collection.ownerId !== command.ownerId) {
        throw new UnauthorizedException(
          'Você não tem permissão para associar fontes de dados a esta coleção.'
        );
      }

      // Verificar se já existe uma fonte com o mesmo nome nesta coleção
      if (await this.dataSourceRepository.existsByNameAndCollection(command.name, command.collectionId)) {
        throw new ConflictException(
          `Já existe uma fonte de dados com o nome '${command.name}' nesta coleção.`,
          'name'
        );
      }

      const dataSource = new DataSource();
      dataSource.id = randomUUID();
      dataSource.collectionId = command.collectionId;
      dataSource.name = command.name;
      dataSource.type = command.type;
      dataSource.connectionUriEncrypted = command.connectionUriEncrypted;
      dataSource.metadata = command.metadata;
      dataSource.isActive = true;

      const createdDataSource = await this.dataSourceRepository.create(dataSource);
      return this.mapToDataSourceDto(createdDataSource);
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException('Erro ao associar fonte de dados à coleção. Por favor, tente novamente.', error);
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

