import { randomUUID } from 'crypto';
import { CreateDataSourceCommand, ICreateDataSourceCommandHandler } from './CreateDataSourceCommand';
import { DataSourceDto } from '../../dto/responses/DataSourceDto';
import { DataSource } from '../../../domain/entities/DataSource';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { IConnectionTester } from '../../../domain/interfaces/IConnectionTester';
import { ConnectionTesterFactory } from '../../../infrastructure/services/ConnectionTesterFactory';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { ValidationException } from '../../../domain/exceptions/ValidationException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class CreateDataSourceCommandHandler implements ICreateDataSourceCommandHandler {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private collectionRepository: ICollectionRepository,
    private schemaExtractionService?: import('../../../infrastructure/services/SchemaExtractionService').SchemaExtractionService,
    private schemaSnapshotRepository?: import('../../../domain/interfaces/ISchemaSnapshotRepository').ISchemaSnapshotRepository,
    private encryptionService?: import('../../../domain/interfaces/IEncryptionService').IEncryptionService
  ) {}

  async handle(command: CreateDataSourceCommand): Promise<DataSourceDto> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(command.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', command.collectionId);
      }

      // Verificar se o usuário é o dono da coleção
      if (collection.ownerId !== command.ownerId) {
        throw new UnauthorizedException(
          'Você não tem permissão para criar fontes de dados nesta coleção.'
        );
      }

      // Verificar se já existe uma fonte com o mesmo nome nesta coleção
      if (await this.dataSourceRepository.existsByNameAndCollection(command.name, command.collectionId)) {
        throw new ConflictException(
          `Já existe uma fonte de dados com o nome '${command.name}' nesta coleção.`,
          'name'
        );
      }

      // Validar e testar conexão
      const connectionTester: IConnectionTester = ConnectionTesterFactory.create(command.type);
      
      if (!connectionTester.validateUri(command.connectionUri)) {
        throw new ValidationException(
          `A URI de conexão fornecida não é válida para o tipo ${command.type}.`,
          [{ property: 'connectionUri', constraints: { invalidFormat: 'Formato de URI inválido' } }]
        );
      }

      // Testar conexão antes de salvar
      const connectionValid = await connectionTester.testConnection(command.connectionUri);
      if (!connectionValid) {
        throw new ValidationException(
          'Não foi possível conectar à fonte de dados. Verifique a URI e as credenciais.',
          [{ property: 'connectionUri', constraints: { connectionFailed: 'Falha na conexão' } }]
        );
      }

      // Criar fonte de dados
      const dataSource = new DataSource();
      dataSource.id = randomUUID();
      dataSource.collectionId = command.collectionId;
      dataSource.name = command.name;
      dataSource.type = command.type;
      dataSource.connectionUriEncrypted = command.connectionUriEncrypted;
      dataSource.metadata = command.metadata;
      dataSource.isActive = true;

      const createdDataSource = await this.dataSourceRepository.create(dataSource);
      
      // Extração automática de schema após cadastro bem-sucedido (opcional, não bloqueia)
      if (this.schemaExtractionService && this.schemaSnapshotRepository && this.encryptionService) {
        this.extractSchemaAsync(createdDataSource).catch((error) => {
          // Log do erro mas não falha o cadastro
          console.error('Erro ao extrair schema automaticamente:', error);
        });
      }
      
      return this.mapToDataSourceDto(createdDataSource);
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException('Erro ao criar fonte de dados. Por favor, tente novamente.', error);
    }
  }

  private async extractSchemaAsync(dataSource: DataSource): Promise<void> {
    if (!dataSource.connectionUriEncrypted || !this.schemaExtractionService || !this.schemaSnapshotRepository || !this.encryptionService) {
      return;
    }

    try {
      const connectionUri = this.encryptionService.decrypt(dataSource.connectionUriEncrypted);
      const tables = await this.schemaExtractionService.extractSchema(connectionUri, dataSource.type);

      const { SchemaSnapshot: SchemaSnapshotClass } = await import('../../../domain/entities/SchemaSnapshot');
      const { randomUUID } = await import('crypto');
      const snapshot = new SchemaSnapshotClass();
      snapshot.id = randomUUID();
      snapshot.dataSourceId = dataSource.id;
      snapshot.generatedAt = new Date();
      snapshot.tables = tables;
      snapshot.version = 1;

      await this.schemaSnapshotRepository.create(snapshot);

      // Atualizar lastScannedAt
      dataSource.lastScannedAt = new Date();
      await this.dataSourceRepository.update(dataSource);
    } catch (error) {
      // Erro silencioso - não deve falhar o cadastro
      console.error('Erro ao extrair schema automaticamente:', error);
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

