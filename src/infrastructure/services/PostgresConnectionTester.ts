import { Pool } from 'pg';
import { IConnectionTester } from '../../domain/interfaces/IConnectionTester';
import { DataSourceType } from '../../domain/entities/DataSource';

export class PostgresConnectionTester implements IConnectionTester {
  getType(): DataSourceType {
    return DataSourceType.PostgreSQL;
  }

  validateUri(connectionUri: string): boolean {
    if (!connectionUri || typeof connectionUri !== 'string') {
      return false;
    }

    // Validação básica de URI PostgreSQL
    // Formato esperado: postgresql://user:password@host:port/database
    // ou postgres://user:password@host:port/database
    const postgresUriPattern = /^postgres(ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/i;
    
    if (postgresUriPattern.test(connectionUri)) {
      return true;
    }

    // Também aceita formato sem credenciais (para casos especiais)
    const postgresUriPatternNoAuth = /^postgres(ql)?:\/\/[^\/]+\/[^\/]+$/i;
    return postgresUriPatternNoAuth.test(connectionUri);
  }

  async testConnection(connectionUri: string): Promise<boolean> {
    if (!this.validateUri(connectionUri)) {
      throw new Error('URI de conexão PostgreSQL inválida');
    }

    let pool: Pool | null = null;
    try {
      pool = new Pool({
        connectionString: connectionUri,
        connectionTimeoutMillis: 5000, // 5 segundos de timeout
      });

      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      return false;
    } finally {
      if (pool) {
        await pool.end();
      }
    }
  }
}

