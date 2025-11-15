import { SchemaMetadata } from '../../../domain/entities/SchemaSnapshot';

export class UpdateSchemaMetadataCommand {
  dataSourceId!: string;
  metadata!: SchemaMetadata;
  ownerId!: string;
}

export interface IUpdateSchemaMetadataCommandHandler {
  handle(command: UpdateSchemaMetadataCommand): Promise<import('../../dto/responses/DataSourceSchemaDto').DataSourceSchemaDto>;
}

