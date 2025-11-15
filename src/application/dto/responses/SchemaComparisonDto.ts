export interface SchemaDifferenceDto {
  type: 'table_added' | 'table_removed' | 'table_modified' | 'column_added' | 'column_removed' | 'column_modified';
  tableName?: string;
  columnName?: string;
  details?: any;
}

export class SchemaComparisonDto {
  hasChanges!: boolean;
  differences!: SchemaDifferenceDto[];
  addedTables!: string[];
  removedTables!: string[];
  modifiedTables!: string[];
  oldSnapshotId!: string;
  newSnapshotId!: string;
  oldVersion!: number;
  newVersion!: number;
}

