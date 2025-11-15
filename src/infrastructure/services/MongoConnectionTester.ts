import { MongoClient, MongoClientOptions } from 'mongodb';
import { IConnectionTester } from '../../domain/interfaces/IConnectionTester';
import { DataSourceType } from '../../domain/entities/DataSource';

export class MongoConnectionTester implements IConnectionTester {
  getType(): DataSourceType {
    return DataSourceType.MongoDB;
  }

  validateUri(connectionUri: string): boolean {
    if (!connectionUri || typeof connectionUri !== 'string') {
      return false;
    }

    // Validação básica de URI MongoDB
    // Formato esperado: mongodb://user:password@host:port/database
    // ou mongodb+srv://user:password@host/database
    const mongoUriPattern = /^mongodb(\+srv)?:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)$/i;
    
    if (mongoUriPattern.test(connectionUri)) {
      return true;
    }

    // Também aceita formato sem credenciais
    const mongoUriPatternNoAuth = /^mongodb(\+srv)?:\/\/[^\/]+\/[^\/]+$/i;
    return mongoUriPatternNoAuth.test(connectionUri);
  }

  async testConnection(connectionUri: string): Promise<boolean> {
    if (!this.validateUri(connectionUri)) {
      throw new Error('URI de conexão MongoDB inválida');
    }

    let client: MongoClient | null = null;
    try {
      const options: MongoClientOptions = {
        serverSelectionTimeoutMS: 5000, // 5 segundos de timeout
        connectTimeoutMS: 5000,
      };

      client = new MongoClient(connectionUri, options);
      await client.connect();
      await client.db().admin().ping();
      return true;
    } catch (error) {
      return false;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }
}

