import { ISchemaExtractor } from '../../domain/interfaces/ISchemaExtractor';
import { DataSourceType } from '../../domain/entities/DataSource';
import { PostgreSQLSchemaExtractor } from './extractors/PostgreSQLSchemaExtractor';
import { MongoDBSchemaExtractor } from './extractors/MongoDBSchemaExtractor';

export class SchemaExtractionService {
  private extractors: Map<DataSourceType, ISchemaExtractor>;

  constructor() {
    this.extractors = new Map();
    this.extractors.set(DataSourceType.PostgreSQL, new PostgreSQLSchemaExtractor());
    this.extractors.set(DataSourceType.MongoDB, new MongoDBSchemaExtractor());
  }

  async extractSchema(connectionUri: string, dataSourceType: DataSourceType): Promise<import('../../domain/entities/SchemaSnapshot').TableInfo[]> {
    const extractor = this.extractors.get(dataSourceType);
    
    if (!extractor) {
      throw new Error(`Extrator de schema não encontrado para o tipo: ${dataSourceType}`);
    }

    return await extractor.extractSchema(connectionUri);
  }
}

