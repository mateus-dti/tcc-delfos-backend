import { DataSourceType } from '../../../domain/entities/DataSource';

export class CreateDataSourceCommand {
  name!: string;
  collectionId!: string;
  type!: DataSourceType;
  connectionUri!: string;
  connectionUriEncrypted!: string;
  metadata?: Record<string, any>;
  ownerId!: string;
}

export interface ICreateDataSourceCommandHandler {
  handle(command: CreateDataSourceCommand): Promise<import('../../dto/responses/DataSourceDto').DataSourceDto>;
}

