import { GetDataSourceSchemaQuery, IGetDataSourceSchemaQueryHandler } from './GetDataSourceSchemaQuery';
import { DataSourceSchemaDto } from '../../dto/responses/DataSourceSchemaDto';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ISchemaSnapshotRepository } from '../../../domain/interfaces/ISchemaSnapshotRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class GetDataSourceSchemaQueryHandler implements IGetDataSourceSchemaQueryHandler {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private schemaSnapshotRepository: ISchemaSnapshotRepository,
    private collectionRepository: ICollectionRepository
  ) {}

  async handle(query: GetDataSourceSchemaQuery): Promise<DataSourceSchemaDto> {
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
          'Você não tem permissão para visualizar schema desta fonte de dados.'
        );
      }

      // Obter snapshot
      let snapshot;
      if (query.version) {
        // Buscar snapshot específico por versão
        const snapshots = await this.schemaSnapshotRepository.getByDataSourceId(query.dataSourceId);
        snapshot = snapshots.find((s) => s.version === query.version);
        if (!snapshot) {
          throw new NotFoundException('Snapshot de schema', `versão ${query.version}`);
        }
      } else {
        // Buscar snapshot mais recente
        snapshot = await this.schemaSnapshotRepository.getLatestByDataSourceId(query.dataSourceId);
        if (!snapshot) {
          throw new NotFoundException(
            'Schema',
            'Nenhum schema extraído encontrado para esta fonte de dados.'
          );
        }
      }

      return this.mapToDto(snapshot);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao obter schema da fonte de dados. Por favor, tente novamente.',
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

