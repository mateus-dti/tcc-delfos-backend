import { ExecuteNaturalLanguageQueryCommand } from './ExecuteNaturalLanguageQueryCommand';
import { Collection } from '../../../domain/entities/Collection';
import { DataSource } from '../../../domain/entities/DataSource';
import { SchemaSnapshot } from '../../../domain/entities/SchemaSnapshot';
import { Model } from '../../../domain/entities/Model';
import { OpenRouterClient } from '../../../infrastructure/clients/OpenRouterClient';
import { TrinoClient } from '../../../infrastructure/clients/TrinoClient';
import { AppDataSource } from '../../../infrastructure/data/data-source';
import { createLogger } from '../../../infrastructure/config/logger';
import * as fs from 'fs';
import * as path from 'path';

export class ExecuteNaturalLanguageQueryCommandHandler {
    private logger = createLogger();
    private openRouterClient: OpenRouterClient;
    private trinoClient: TrinoClient;
    private collectionRepository = AppDataSource.getRepository(Collection);
    private schemaSnapshotRepository = AppDataSource.getRepository(SchemaSnapshot);
    private modelRepository = AppDataSource.getRepository(Model);

    constructor() {
        this.openRouterClient = new OpenRouterClient();
        this.trinoClient = new TrinoClient();
    }

    async handle(command: ExecuteNaturalLanguageQueryCommand): Promise<any[]> {
        const { collectionId, modelId, query } = command;

        this.logger.info(`Iniciando processamento de query NL para coleção ${collectionId} usando modelo ${modelId}`);

        // 1. Buscar Coleção, DataSources e Modelo
        const collection = await this.collectionRepository.findOne({
            where: { id: collectionId },
            relations: ['dataSources'],
        });

        if (!collection) {
            throw new Error('Coleção não encontrada');
        }

        if (!collection.dataSources || collection.dataSources.length === 0) {
            throw new Error('A coleção selecionada não possui fontes de dados');
        }

        const model = await this.modelRepository.findOne({
            where: { id: modelId }
        });

        if (!model) {
            throw new Error('Modelo não encontrado');
        }

        // 2. Buscar Catálogos Disponíveis no Trino
        const availableCatalogs = await this.trinoClient.getCatalogs();
        this.logger.info(`Catálogos disponíveis no Trino: ${availableCatalogs.join(', ')}`);

        // 3. Construir Contexto do Schema
        const schemaContext = await this.buildSchemaContext(collection.dataSources, availableCatalogs);

        // 4. Carregar Prompt Template
        const promptTemplate = await this.loadPromptTemplate();

        // 5. Construir Prompt Final
        const finalPrompt = promptTemplate
            .replace('[CATÁLOGOS DISPONÍVEIS]', availableCatalogs.map(c => `- ${c}`).join('\n'))
            .replace('[SCHEMA AQUI]', schemaContext)
            .replace('[MENSAGEM DO USUÁRIO AQUI]', query);

        // 6. DEBUG: Salvar prompt gerado em arquivo
        const debugDir = path.join(__dirname, '../../../../debug_prompts');
        if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const debugFilePath = path.join(debugDir, `prompt_${timestamp}.txt`);
        fs.writeFileSync(debugFilePath, finalPrompt);
        this.logger.info(`DEBUG: Prompt salvo em ${debugFilePath}`);

        // 7. Gerar SQL via OpenRouter
        const generatedSql = await this.openRouterClient.generateCompletion(model.identifier, finalPrompt);
        const cleanSql = this.extractSql(generatedSql);

        this.logger.info(`SQL Gerado: ${cleanSql}`);

        // 8. Executar SQL no Trino
        const results = await this.trinoClient.executeQuery(cleanSql);

        return results;
    }

    private async buildSchemaContext(dataSources: DataSource[], availableCatalogs: string[]): Promise<string> {
        let schemaContext = '';

        for (const ds of dataSources) {
            // Buscar o snapshot mais recente para este DataSource
            const snapshot = await this.schemaSnapshotRepository.findOne({
                where: { dataSourceId: ds.id },
                order: { createdAt: 'DESC' },
            });

            if (snapshot) {
                schemaContext += `\n--- DataSource: ${ds.name} (${ds.type}) ---\n`;

                // Tentar encontrar o catálogo real correspondente ao datasource
                const catalogName = this.resolveCatalogName(ds.name, availableCatalogs);

                for (const table of snapshot.tables) {
                    const schemaName = 'public'; // Default para postgres, ajustar se necessário
                    const tableName = table.name;

                    schemaContext += `Table: ${catalogName}.${schemaName}.${tableName}\n`;
                    schemaContext += `Columns:\n`;
                    table.columns.forEach(col => {
                        schemaContext += `  - ${col.name} (${col.type})\n`;
                    });
                    schemaContext += `\n`;
                }
            }
        }

        return schemaContext;
    }

    private resolveCatalogName(dataSourceName: string, availableCatalogs: string[]): string {
        const sanitized = this.sanitizeCatalogName(dataSourceName);

        // 1. Tentativa exata com o nome sanitizado
        if (availableCatalogs.includes(sanitized)) {
            return sanitized;
        }

        // 2. Tentativa exata com o nome original (caso o usuário tenha cadastrado igual ao trino)
        if (availableCatalogs.includes(dataSourceName)) {
            return dataSourceName;
        }

        // 3. Tentativa de encontrar um catálogo que contenha o nome sanitizado
        const partialMatch = availableCatalogs.find(c => c.includes(sanitized) || sanitized.includes(c));
        if (partialMatch) {
            return partialMatch;
        }

        // Fallback: retorna o sanitizado e torce para o modelo se virar com a lista de catálogos disponíveis
        return sanitized;
    }

    private sanitizeCatalogName(name: string): string {
        // Remove caracteres especiais e espaços, converte para minúsculo
        // Ex: "Vendas 2023" -> "vendas_2023"
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    private async loadPromptTemplate(): Promise<string> {
        const promptPath = path.join(__dirname, '../../../infrastructure/prompts/trino_nl2sql.md');
        try {
            return fs.readFileSync(promptPath, 'utf-8');
        } catch (error) {
            this.logger.error(`Erro ao ler arquivo de prompt em: ${promptPath}`, error);
            throw new Error('Não foi possível carregar o template de prompt');
        }
    }

    private extractSql(response: string): string {
        // Remove blocos de código markdown ```sql ... ``` ou ``` ... ```
        const sqlMatch = response.match(/```(?:sql)?\s*([\s\S]*?)\s*```/);
        if (sqlMatch) {
            return sqlMatch[1].trim();
        }
        // Se não houver blocos de código, assume que a resposta inteira é o SQL
        // mas remove possíveis prefixos/sufixos de texto se o modelo for "falador"
        // O prompt pede estritamente SQL, então vamos confiar mas limpar espaços.
        return response.trim();
    }
}
