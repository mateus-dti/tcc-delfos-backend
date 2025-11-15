import { randomUUID } from 'crypto';
import { ExtractSchemaCommand, IExtractSchemaCommandHandler } from './ExtractSchemaCommand';
import { SchemaSnapshotDto } from '../../dto/responses/SchemaSnapshotDto';
import { SchemaSnapshot } from '../../../domain/entities/SchemaSnapshot';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ISchemaSnapshotRepository } from '../../../domain/interfaces/ISchemaSnapshotRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { SchemaExtractionService } from '../../../infrastructure/services/SchemaExtractionService';
import { IEncryptionService } from '../../../domain/interfaces/IEncryptionService';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class ExtractSchemaCommandHandler implements IExtractSchemaCommandHandler {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private schemaSnapshotRepository: ISchemaSnapshotRepository,
    private collectionRepository: ICollectionRepository,
    private schemaExtractionService: SchemaExtractionService,
    private encryptionService: IEncryptionService
  ) {}

  async handle(command: ExtractSchemaCommand): Promise<SchemaSnapshotDto> {
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
          'Você não tem permissão para extrair schema desta fonte de dados.'
        );
      }

      // Verificar se há URI de conexão
      if (!dataSource.connectionUriEncrypted) {
        throw new DatabaseException(
          'A fonte de dados não possui URI de conexão configurada.'
        );
      }

      // Descriptografar URI
      const connectionUri = this.encryptionService.decrypt(dataSource.connectionUriEncrypted);

      // Extrair schema
      const tables = await this.schemaExtractionService.extractSchema(
        connectionUri,
        dataSource.type
      );

      // Obter versão do último snapshot
      const latestSnapshot = await this.schemaSnapshotRepository.getLatestByDataSourceId(
        command.dataSourceId
      );
      const nextVersion = latestSnapshot ? latestSnapshot.version + 1 : 1;

      // Criar snapshot
      const snapshot = new SchemaSnapshot();
      snapshot.id = randomUUID();
      snapshot.dataSourceId = command.dataSourceId;
      snapshot.generatedAt = new Date();
      snapshot.tables = tables;
      snapshot.version = nextVersion;

      const createdSnapshot = await this.schemaSnapshotRepository.create(snapshot);

      // Atualizar lastScannedAt na fonte de dados
      dataSource.lastScannedAt = new Date();
      await this.dataSourceRepository.update(dataSource);

      return this.mapToDto(createdSnapshot);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof DatabaseException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao extrair schema da fonte de dados. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToDto(snapshot: SchemaSnapshot): SchemaSnapshotDto {
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

