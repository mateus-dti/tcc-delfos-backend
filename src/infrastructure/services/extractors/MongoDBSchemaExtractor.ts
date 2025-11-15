import { MongoClient, Db, Collection as MongoCollection } from 'mongodb';
import { ISchemaExtractor } from '../../../domain/interfaces/ISchemaExtractor';
import { DataSourceType } from '../../../domain/entities/DataSource';
import { TableInfo, TableColumn, TableKey } from '../../../domain/entities/SchemaSnapshot';

export class MongoDBSchemaExtractor implements ISchemaExtractor {
  getType(): DataSourceType {
    return DataSourceType.MongoDB;
  }

  async extractSchema(connectionUri: string): Promise<TableInfo[]> {
    let client: MongoClient | null = null;
    try {
      client = new MongoClient(connectionUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });

      await client.connect();
      const db: Db = client.db();

      // Obter todas as coleções
      const collections = await db.listCollections().toArray();
      const tables: TableInfo[] = [];

      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        
        // Pular coleções do sistema
        if (collectionName.startsWith('system.')) {
          continue;
        }

        const collection: MongoCollection = db.collection(collectionName);
        
        // Extrair schema da coleção
        const tableInfo = await this.extractCollectionSchema(collection, collectionName);
        tables.push(tableInfo);
      }

      return tables;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  private async extractCollectionSchema(
    collection: MongoCollection,
    collectionName: string
  ): Promise<TableInfo> {
    // Obter amostras de documentos
    const sampleDocs = await collection.find({}).limit(10).toArray();
    
    // Analisar estrutura dos documentos para inferir schema
    const columns = this.inferColumns(sampleDocs);
    
    // MongoDB não tem chaves primárias/estrangeiras no sentido SQL
    // Mas podemos identificar índices
    const keys = await this.extractIndexes(collection, collectionName);
    
    // Converter documentos para formato serializável
    const sampleRows = sampleDocs.map((doc) => {
      const serialized: Record<string, any> = {};
      for (const [key, value] of Object.entries(doc)) {
        if (value instanceof Date) {
          serialized[key] = value.toISOString();
        } else if (Buffer.isBuffer(value)) {
          serialized[key] = value.toString('base64');
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          serialized[key] = JSON.stringify(value);
        } else {
          serialized[key] = value;
        }
      }
      return serialized;
    });

    return {
      name: collectionName,
      columns,
      keys,
      sampleRows,
    };
  }

  private inferColumns(documents: any[]): TableColumn[] {
    const columnMap = new Map<string, { types: Set<string>; nullable: boolean }>();

    // Analisar todos os documentos para inferir tipos
    for (const doc of documents) {
      for (const [key, value] of Object.entries(doc)) {
        if (!columnMap.has(key)) {
          columnMap.set(key, { types: new Set(), nullable: false });
        }

        const columnInfo = columnMap.get(key)!;
        
        if (value === null || value === undefined) {
          columnInfo.nullable = true;
        } else {
          let type = this.getMongoType(value);
          columnInfo.types.add(type);
        }
      }
    }

    // Converter para array de TableColumn
    const columns: TableColumn[] = [];
    for (const [name, info] of columnMap.entries()) {
      // Se houver múltiplos tipos, usar "mixed" ou o mais comum
      let type = 'mixed';
      if (info.types.size === 1) {
        type = Array.from(info.types)[0];
      } else if (info.types.size > 1) {
        type = `mixed (${Array.from(info.types).join(', ')})`;
      }

      columns.push({
        name,
        type,
        nullable: info.nullable,
      });
    }

    return columns;
  }

  private getMongoType(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    if (value instanceof Date) {
      return 'date';
    }
    if (Buffer.isBuffer(value)) {
      return 'binary';
    }
    if (typeof value === 'object') {
      return 'object';
    }
    return typeof value;
  }

  private async extractIndexes(
    collection: MongoCollection,
    _collectionName: string
  ): Promise<TableKey[]> {
    const keys: TableKey[] = [];
    
    try {
      const indexes = await collection.indexes();
      
      for (const index of indexes) {
        const indexName = index.name || 'unnamed';
        const indexKeys = Object.keys(index.key || {});
        
        if (indexKeys.length === 0) {
          continue;
        }

        let keyType: 'primary' | 'unique' | 'index' = 'index';
        
        // Identificar chave primária por convenção _id
        // MongoDB sempre cria um índice único no campo _id automaticamente
        if (indexName === '_id_' || (indexKeys.length === 1 && indexKeys[0] === '_id' && index.unique)) {
          keyType = 'primary';
        } else if (index.unique) {
          keyType = 'unique';
        }

        keys.push({
          type: keyType,
          name: indexName,
          columns: indexKeys,
        });
      }
    } catch (error) {
      // Se houver erro ao obter índices, continuar sem eles
    }

    // Garantir que sempre há uma chave primária _id se a coleção tiver documentos
    // Mesmo que o índice não tenha sido encontrado, _id é sempre a chave primária no MongoDB
    const hasIdPrimaryKey = keys.some(k => k.type === 'primary' && k.columns.includes('_id'));
    if (!hasIdPrimaryKey) {
      // Verificar se existe coluna _id nos documentos
      const sampleDoc = await collection.findOne({});
      if (sampleDoc && '_id' in sampleDoc) {
        keys.unshift({
          type: 'primary',
          name: '_id',
          columns: ['_id'],
        });
      }
    }

    return keys;
  }
}

