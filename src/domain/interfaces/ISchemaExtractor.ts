import { DataSourceType } from '../entities/DataSource';
import { TableInfo } from '../entities/SchemaSnapshot';

export interface ISchemaExtractor {
  extractSchema(connectionUri: string): Promise<TableInfo[]>;
  getType(): DataSourceType;
}

