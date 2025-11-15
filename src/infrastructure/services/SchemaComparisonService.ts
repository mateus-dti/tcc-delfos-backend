import { SchemaSnapshot, TableInfo } from '../../domain/entities/SchemaSnapshot';

export interface SchemaDifference {
  type: 'table_added' | 'table_removed' | 'table_modified' | 'column_added' | 'column_removed' | 'column_modified';
  tableName?: string;
  columnName?: string;
  details?: any;
}

export interface SchemaComparisonResult {
  hasChanges: boolean;
  differences: SchemaDifference[];
  addedTables: string[];
  removedTables: string[];
  modifiedTables: string[];
}

export class SchemaComparisonService {
  /**
   * Compara dois snapshots de schema e retorna as diferenças
   */
  compareSnapshots(oldSnapshot: SchemaSnapshot, newSnapshot: SchemaSnapshot): SchemaComparisonResult {
    const differences: SchemaDifference[] = [];
    const addedTables: string[] = [];
    const removedTables: string[] = [];
    const modifiedTables: string[] = [];

    const oldTablesMap = new Map<string, TableInfo>();
    const newTablesMap = new Map<string, TableInfo>();

    // Criar mapas de tabelas
    oldSnapshot.tables.forEach((table) => {
      oldTablesMap.set(table.name, table);
    });

    newSnapshot.tables.forEach((table) => {
      newTablesMap.set(table.name, table);
    });

    // Verificar tabelas adicionadas
    newTablesMap.forEach((newTable, tableName) => {
      if (!oldTablesMap.has(tableName)) {
        addedTables.push(tableName);
        differences.push({
          type: 'table_added',
          tableName: tableName,
          details: { columns: newTable.columns.length },
        });
      }
    });

    // Verificar tabelas removidas
    oldTablesMap.forEach((_oldTable, tableName) => {
      if (!newTablesMap.has(tableName)) {
        removedTables.push(tableName);
        differences.push({
          type: 'table_removed',
          tableName: tableName,
        });
      }
    });

    // Verificar tabelas modificadas
    oldTablesMap.forEach((oldTable, tableName) => {
      const newTable = newTablesMap.get(tableName);
      if (newTable) {
        const tableDifferences = this.compareTables(oldTable, newTable, tableName);
        if (tableDifferences.length > 0) {
          modifiedTables.push(tableName);
          differences.push(...tableDifferences);
        }
      }
    });

    return {
      hasChanges: differences.length > 0,
      differences,
      addedTables,
      removedTables,
      modifiedTables,
    };
  }

  /**
   * Compara duas tabelas e retorna as diferenças
   */
  private compareTables(oldTable: TableInfo, newTable: TableInfo, tableName: string): SchemaDifference[] {
    const differences: SchemaDifference[] = [];

    const oldColumnsMap = new Map<string, typeof oldTable.columns[0]>();
    const newColumnsMap = new Map<string, typeof newTable.columns[0]>();

    oldTable.columns.forEach((col) => {
      oldColumnsMap.set(col.name, col);
    });

    newTable.columns.forEach((col) => {
      newColumnsMap.set(col.name, col);
    });

    // Verificar colunas adicionadas
    newColumnsMap.forEach((newCol, colName) => {
      if (!oldColumnsMap.has(colName)) {
        differences.push({
          type: 'column_added',
          tableName: tableName,
          columnName: colName,
          details: { type: newCol.type, nullable: newCol.nullable },
        });
      }
    });

    // Verificar colunas removidas
    oldColumnsMap.forEach((_oldCol, colName) => {
      if (!newColumnsMap.has(colName)) {
        differences.push({
          type: 'column_removed',
          tableName: tableName,
          columnName: colName,
        });
      }
    });

    // Verificar colunas modificadas
    oldColumnsMap.forEach((oldCol, colName) => {
      const newCol = newColumnsMap.get(colName);
      if (newCol) {
        const columnDifferences = this.compareColumns(oldCol, newCol, tableName, colName);
        differences.push(...columnDifferences);
      }
    });

    // Verificar diferenças nas chaves
    const oldKeysMap = new Map<string, typeof oldTable.keys[0]>();
    const newKeysMap = new Map<string, typeof newTable.keys[0]>();

    oldTable.keys.forEach((key) => {
      oldKeysMap.set(key.name, key);
    });

    newTable.keys.forEach((key) => {
      newKeysMap.set(key.name, key);
    });

    // Verificar chaves adicionadas/removidas/modificadas
    const allKeyNames = new Set([...oldKeysMap.keys(), ...newKeysMap.keys()]);
    allKeyNames.forEach((keyName) => {
      const oldKey = oldKeysMap.get(keyName);
      const newKey = newKeysMap.get(keyName);

      if (!oldKey && newKey) {
        differences.push({
          type: 'table_modified',
          tableName: tableName,
          details: { keyAdded: keyName },
        });
      } else if (oldKey && !newKey) {
        differences.push({
          type: 'table_modified',
          tableName: tableName,
          details: { keyRemoved: keyName },
        });
      } else if (oldKey && newKey) {
        const keysEqual = JSON.stringify(oldKey) === JSON.stringify(newKey);
        if (!keysEqual) {
          differences.push({
            type: 'table_modified',
            tableName: tableName,
            details: { keyModified: keyName },
          });
        }
      }
    });

    return differences;
  }

  /**
   * Compara duas colunas e retorna as diferenças
   */
  private compareColumns(
    oldCol: TableInfo['columns'][0],
    newCol: TableInfo['columns'][0],
    tableName: string,
    colName: string
  ): SchemaDifference[] {
    const differences: SchemaDifference[] = [];

    if (oldCol.type !== newCol.type) {
      differences.push({
        type: 'column_modified',
        tableName: tableName,
        columnName: colName,
        details: {
          field: 'type',
          oldValue: oldCol.type,
          newValue: newCol.type,
        },
      });
    }

    if (oldCol.nullable !== newCol.nullable) {
      differences.push({
        type: 'column_modified',
        tableName: tableName,
        columnName: colName,
        details: {
          field: 'nullable',
          oldValue: oldCol.nullable,
          newValue: newCol.nullable,
        },
      });
    }

    return differences;
  }
}

