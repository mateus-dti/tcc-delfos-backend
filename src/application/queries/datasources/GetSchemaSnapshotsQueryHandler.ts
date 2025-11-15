import { GetSchemaSnapshotsQuery, IGetSchemaSnapshotsQueryHandler } from './GetSchemaSnapshotsQuery';
import { SchemaSnapshotDto } from '../../dto/responses/SchemaSnapshotDto';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ISchemaSnapshotRepository } from '../../../domain/interfaces/ISchemaSnapshotRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class GetSchemaSnapshotsQueryHandler implements IGetSchemaSnapshotsQueryHandler {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private schemaSnapshotRepository: ISchemaSnapshotRepository,
    private collectionRepository: ICollectionRepository
  ) {}

  async handle(query: GetSchemaSnapshotsQuery): Promise<SchemaSnapshotDto[]> {
    try {
      // Verificar se a fonte de dados existe
      const dataSource = await this.dataSourceRepository.getById(query.dataSourceId);
      if (!dataSource) {
        throw new NotFoundException('Fonte de dados', query.dataSourceId);
      }

      // Verificar se o usuário é o dono da coleção
      const collection = await this.collectionRepository.getById(dataSource.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', dataSource.collectionId);
      }

      if (collection.ownerId !== query.ownerId) {
        throw new ForbiddenException(
          'Você não tem permissão para visualizar snapshots desta fonte de dados.'
        );
      }

      // Obter todos os snapshots
      const snapshots = await this.schemaSnapshotRepository.getByDataSourceId(query.dataSourceId);

      return snapshots.map((snapshot) => this.mapToDto(snapshot));
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao obter snapshots da fonte de dados. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToDto(snapshot: import('../../../domain/entities/SchemaSnapshot').SchemaSnapshot): SchemaSnapshotDto {
    return {
      id: snapshot.id,
      dataSourceId: snapshot.dataSourceId,
      generatedAt: snapshot.generatedAt,
      tables: snapshot.tables,
      version: snapshot.version,
      createdAt: snapshot.createdAt,
    };
  }
}

