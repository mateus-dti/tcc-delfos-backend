export class RelationshipDto {
  id!: string;
  collectionId!: string;
  sourceTable!: string;
  sourceColumn!: string;
  targetTable!: string;
  targetColumn!: string;
  confidence!: number; // 0-1
  manualOverride!: boolean;
  sourceDataSourceId?: string;
  targetDataSourceId?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

