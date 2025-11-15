import { UpdateSchemaMetadataCommand, IUpdateSchemaMetadataCommandHandler } from './UpdateSchemaMetadataCommand';
import { DataSourceSchemaDto } from '../../dto/responses/DataSourceSchemaDto';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ISchemaSnapshotRepository } from '../../../domain/interfaces/ISchemaSnapshotRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class UpdateSchemaMetadataCommandHandler implements IUpdateSchemaMetadataCommandHandler {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private schemaSnapshotRepository: ISchemaSnapshotRepository,
    private collectionRepository: ICollectionRepository
  ) {}

  async handle(command: UpdateSchemaMetadataCommand): Promise<DataSourceSchemaDto> {
    try {
      // Verificar se a fonte de dados existe
      const dataSource = await this.dataSourceRepository.getById(command.dataSourceId);
      if (!dataSource) {
        throw new NotFoundException('Fonte de dados', command.dataSourceId);
      }

      // Verificar se o usuário é o dono da coleção
      const collection = await this.collectionRepository.getById(dataSource.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', dataSource.collectionId);
      }

      if (collection.ownerId !== command.ownerId) {
        throw new ForbiddenException(
          'Você não tem permissão para editar metadados desta fonte de dados.'
        );
      }

      // Obter snapshot mais recente
      const snapshot = await this.schemaSnapshotRepository.getLatestByDataSourceId(
        command.dataSourceId
      );
      if (!snapshot) {
        throw new NotFoundException(
          'Schema',
          'Nenhum schema extraído encontrado para esta fonte de dados. Execute a extração primeiro.'
        );
      }

      // Atualizar metadados (merge com metadados existentes)
      snapshot.metadata = {
        ...snapshot.metadata,
        ...command.metadata,
        tables: {
          ...snapshot.metadata?.tables,
          ...command.metadata.tables,
        },
      };

      // Atualizar snapshot
      const updatedSnapshot = await this.schemaSnapshotRepository.update(snapshot);

      return this.mapToDto(updatedSnapshot);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao atualizar metadados do schema. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToDto(snapshot: import('../../../domain/entities/SchemaSnapshot').SchemaSnapshot): DataSourceSchemaDto {
    return {
      dataSourceId: snapshot.dataSourceId,
      snapshotId: snapshot.id,
      generatedAt: snapshot.generatedAt,
      version: snapshot.version,
      tables: snapshot.tables,
      metadata: snapshot.metadata,
      createdAt: snapshot.createdAt,
    };
  }
}

