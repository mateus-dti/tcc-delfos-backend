import { TableInfo } from '../../../domain/entities/SchemaSnapshot';

export class SchemaSnapshotDto {
  id!: string;
  dataSourceId!: string;
  generatedAt!: Date;
  tables!: TableInfo[];
  version!: number;
  createdAt!: Date;
}

