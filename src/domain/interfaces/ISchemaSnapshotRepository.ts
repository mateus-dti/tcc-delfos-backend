import { SchemaSnapshot } from '../entities/SchemaSnapshot';

export interface ISchemaSnapshotRepository {
  getById(id: string): Promise<SchemaSnapshot | null>;
  getByDataSourceId(dataSourceId: string): Promise<SchemaSnapshot[]>;
  getLatestByDataSourceId(dataSourceId: string): Promise<SchemaSnapshot | null>;
  create(snapshot: SchemaSnapshot): Promise<SchemaSnapshot>;
  update(snapshot: SchemaSnapshot): Promise<SchemaSnapshot>;
  delete(id: string): Promise<boolean>;
}

