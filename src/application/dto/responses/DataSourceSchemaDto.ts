import { TableInfo, SchemaMetadata } from '../../../domain/entities/SchemaSnapshot';

export class DataSourceSchemaDto {
  dataSourceId!: string;
  snapshotId!: string;
  generatedAt!: Date;
  version!: number;
  tables!: TableInfo[];
  metadata?: SchemaMetadata;
  createdAt!: Date;
}

