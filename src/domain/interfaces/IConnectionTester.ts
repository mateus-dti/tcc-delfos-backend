import { DataSourceType } from '../entities/DataSource';

export interface IConnectionTester {
  testConnection(connectionUri: string): Promise<boolean>;
  validateUri(connectionUri: string): boolean;
  getType(): DataSourceType;
}

