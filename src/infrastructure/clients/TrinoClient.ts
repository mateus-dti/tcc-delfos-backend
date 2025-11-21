import { Trino, BasicAuth } from 'trino-client';
import { createLogger } from '../config/logger';

export class TrinoClient {
    private client: Trino;
    private logger = createLogger();

    constructor() {
        // Configuração padrão para o ambiente Docker local
        this.client = Trino.create({
            server: 'http://localhost:8080',
            catalog: 'memory', // Default catalog, can be overridden in query
            schema: 'default',  // Default schema
            auth: new BasicAuth('delfos', ''), // User 'delfos', no password by default
        });
    }

    /**
     * Executa uma query SQL no Trino
     * @param query Query SQL a ser executada
     * @returns Array de linhas resultantes
     */
    async executeQuery(query: string): Promise<any[]> {
        try {
            this.logger.info(`Executando query no Trino: ${query}`);

            const iter = await this.client.query(query);
            const rows: any[] = [];

            for await (const queryResult of iter) {
                if (queryResult.data) {
                    rows.push(...queryResult.data);
                }
            }

            this.logger.info(`Query executada com sucesso. Retornou ${rows.length} linhas.`);
            return rows;
        } catch (error) {
            this.logger.error('Erro ao executar query no Trino:', error);
            throw error;
        }
    }

    /**
     * Busca a lista de catálogos disponíveis no Trino
     * @returns Array com nomes dos catálogos
     */
    async getCatalogs(): Promise<string[]> {
        try {
            const rows = await this.executeQuery('SHOW CATALOGS');
            // O resultado de SHOW CATALOGS é uma lista de linhas onde a primeira coluna é 'Catalog'
            return rows.map(row => row[0]);
        } catch (error) {
            this.logger.error('Erro ao buscar catálogos do Trino:', error);
            return [];
        }
    }
}
