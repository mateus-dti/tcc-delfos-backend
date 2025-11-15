import { IConnectionTester } from '../../domain/interfaces/IConnectionTester';
import { DataSourceType } from '../../domain/entities/DataSource';
import { PostgresConnectionTester } from './PostgresConnectionTester';
import { MongoConnectionTester } from './MongoConnectionTester';

export class ConnectionTesterFactory {
  static create(type: DataSourceType): IConnectionTester {
    switch (type) {
      case DataSourceType.PostgreSQL:
        return new PostgresConnectionTester();
      case DataSourceType.MongoDB:
        return new MongoConnectionTester();
      default:
        throw new Error(`Tipo de fonte de dados não suportado: ${type}`);
    }
  }
}

