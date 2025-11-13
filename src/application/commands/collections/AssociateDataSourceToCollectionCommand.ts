import { DataSourceDto } from '../../dto/responses/DataSourceDto';
import { DataSourceType } from '../../../domain/entities/DataSource';

export class AssociateDataSourceToCollectionCommand {
  collectionId!: string;
  name!: string;
  type!: DataSourceType;
  connectionUriEncrypted?: string;
  metadata?: Record<string, any>;
  ownerId!: string; // Para validação de permissão
}

export interface IAssociateDataSourceToCollectionCommandHandler {
  handle(command: AssociateDataSourceToCollectionCommand): Promise<DataSourceDto>;
}

