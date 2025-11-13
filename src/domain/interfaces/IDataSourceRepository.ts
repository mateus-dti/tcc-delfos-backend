import { DataSource } from '../entities/DataSource';

export interface IDataSourceRepository {
  getById(id: string): Promise<DataSource | null>;
  getByCollectionId(collectionId: string): Promise<DataSource[]>;
  getByNameAndCollection(name: string, collectionId: string): Promise<DataSource | null>;
  create(dataSource: DataSource): Promise<DataSource>;
  update(dataSource: DataSource): Promise<DataSource>;
  delete(id: string): Promise<boolean>;
  existsByNameAndCollection(name: string, collectionId: string): Promise<boolean>;
  existsByIdAndCollection(id: string, collectionId: string): Promise<boolean>;
}

