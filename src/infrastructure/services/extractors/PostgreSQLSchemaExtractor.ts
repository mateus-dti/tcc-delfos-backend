import { Pool } from 'pg';
import { ISchemaExtractor } from '../../../domain/interfaces/ISchemaExtractor';
import { DataSourceType } from '../../../domain/entities/DataSource';
import { TableInfo, TableColumn, TableKey } from '../../../domain/entities/SchemaSnapshot';

export class PostgreSQLSchemaExtractor implements ISchemaExtractor {
  getType(): DataSourceType {
    return DataSourceType.PostgreSQL;
  }

  async extractSchema(connectionUri: string): Promise<TableInfo[]> {
    let pool: Pool | null = null;
    try {
      pool = new Pool({
        connectionString: connectionUri,
        connectionTimeoutMillis: 10000,
      });

      const client = await pool.connect();
      
      try {
        // Obter todas as tabelas do schema público
        const tablesQuery = `
          SELECT 
            table_name,
            table_schema
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `;

        const tablesResult = await client.query(tablesQuery);
        const tables: TableInfo[] = [];

        for (const tableRow of tablesResult.rows) {
          const tableName = tableRow.table_name;
          
          // Extrair colunas
          const columns = await this.extractColumns(client, tableName);
          
          // Extrair chaves (primary, foreign, unique, indexes)
          const keys = await this.extractKeys(client, tableName);
          
          // Extrair amostras de dados (primeiras 10 linhas)
          const sampleRows = await this.extractSampleRows(client, tableName);

          tables.push({
            name: tableName,
            columns,
            keys,
            sampleRows,
          });
        }

        return tables;
      } finally {
        client.release();
      }
    } finally {
      if (pool) {
        await pool.end();
      }
    }
  }

  private async extractColumns(client: any, tableName: string): Promise<TableColumn[]> {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
    `;

    const result = await client.query(query, [tableName]);
    
    return result.rows.map((row: any) => ({
      name: row.column_name,
      type: this.formatDataType(row),
      nullable: row.is_nullable === 'YES',
      description: row.column_default ? `Default: ${row.column_default}` : undefined,
    }));
  }

  private formatDataType(row: any): string {
    let type = row.data_type;
    
    if (row.character_maximum_length) {
      type += `(${row.character_maximum_length})`;
    } else if (row.numeric_precision && row.numeric_scale) {
      type += `(${row.numeric_precision},${row.numeric_scale})`;
    } else if (row.numeric_precision) {
      type += `(${row.numeric_precision})`;
    }
    
    return type;
  }

  private async extractKeys(client: any, tableName: string): Promise<TableKey[]> {
    const keys: TableKey[] = [];

    // Primary Keys (suporta chaves primárias compostas)
    // Consulta INFORMATION_SCHEMA.table_constraints e INFORMATION_SCHEMA.key_column_usage
    const pkQuery = `
      SELECT
        kcu.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        AND tc.table_name = kcu.table_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
      ORDER BY kcu.ordinal_position;
    `;

    const pkResult = await client.query(pkQuery, [tableName]);
    if (pkResult.rows.length > 0) {
      // Extrair todas as colunas da chave primária (suporta chaves compostas)
      const pkColumns = pkResult.rows.map((r: any) => r.column_name);
      keys.push({
        type: 'primary',
        name: pkResult.rows[0].constraint_name,
        columns: pkColumns,
      });
    }

    // Foreign Keys (suporta chaves compostas)
    // Usa referential_constraints para obter a tabela referenciada corretamente
    const fkQuery = `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        kcu.ordinal_position,
        kcu.position_in_unique_constraint,
        rc.unique_constraint_schema,
        rc.unique_constraint_name,
        kcu2.table_name AS foreign_table_name,
        kcu2.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
        AND tc.table_schema = rc.constraint_schema
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        AND tc.table_name = kcu.table_name
      JOIN information_schema.key_column_usage AS kcu2
        ON rc.unique_constraint_name = kcu2.constraint_name
        AND rc.unique_constraint_schema = kcu2.table_schema
        AND kcu.position_in_unique_constraint = kcu2.ordinal_position
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
      ORDER BY tc.constraint_name, kcu.ordinal_position;
    `;

    const fkResult = await client.query(fkQuery, [tableName]);
    
    // Agrupar por constraint_name para suportar chaves compostas
    const fkMap = new Map<string, {
      name: string;
      columns: string[];
      referencedTable: string;
      referencedColumns: string[];
    }>();

    for (const row of fkResult.rows) {
      if (!fkMap.has(row.constraint_name)) {
        fkMap.set(row.constraint_name, {
          name: row.constraint_name,
          columns: [],
          referencedTable: row.foreign_table_name,
          referencedColumns: [],
        });
      }
      
      const fkInfo = fkMap.get(row.constraint_name)!;
      fkInfo.columns.push(row.column_name);
      fkInfo.referencedColumns.push(row.foreign_column_name);
    }

    // Adicionar todas as foreign keys ao array de keys
    for (const fkInfo of fkMap.values()) {
      keys.push({
        type: 'foreign',
        name: fkInfo.name,
        columns: fkInfo.columns,
        referencedTable: fkInfo.referencedTable,
        referencedColumns: fkInfo.referencedColumns,
      });
    }

    // Unique Constraints
    const uniqueQuery = `
      SELECT
        tc.constraint_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_name NOT IN (
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE constraint_type = 'PRIMARY KEY'
            AND table_schema = 'public'
            AND table_name = $1
        );
    `;

    const uniqueResult = await client.query(uniqueQuery, [tableName]);
    for (const row of uniqueResult.rows) {
      keys.push({
        type: 'unique',
        name: row.constraint_name,
        columns: [row.column_name],
      });
    }

    // Indexes (não são constraints, mas são importantes)
    const indexQuery = `
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = $1
        AND indexname NOT LIKE '%_pkey'
        AND indexname NOT LIKE '%_fkey'
        AND indexname NOT LIKE '%_key';
    `;

    const indexResult = await client.query(indexQuery, [tableName]);
    for (const row of indexResult.rows) {
      // Extrair colunas do indexdef
      const columnsMatch = row.indexdef.match(/\(([^)]+)\)/);
      const columns = columnsMatch
        ? columnsMatch[1].split(',').map((c: string) => c.trim().replace(/"/g, ''))
        : [];

      keys.push({
        type: 'index',
        name: row.indexname,
        columns,
      });
    }

    return keys;
  }

  private async extractSampleRows(client: any, tableName: string): Promise<Record<string, any>[]> {
    try {
      // Usar quote_ident para evitar SQL injection
      const quotedName = await client.query(`SELECT quote_ident($1) as name`, [tableName]);
      const safeTableName = quotedName.rows[0].name;
      const safeQuery = `SELECT * FROM ${safeTableName} LIMIT 10`;
      const result = await client.query(safeQuery);
      
      // Converter valores para JSON serializável
      return result.rows.map((row: any) => {
        const serializedRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          // Converter Date para string ISO
          if (value instanceof Date) {
            serializedRow[key] = value.toISOString();
          } else if (Buffer.isBuffer(value)) {
            serializedRow[key] = value.toString('base64');
          } else {
            serializedRow[key] = value;
          }
        }
        return serializedRow;
      });
    } catch (error) {
      // Se houver erro ao extrair amostras, retornar array vazio
      return [];
    }
  }
}

