import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DataSource } from './DataSource';

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

export interface TableKey {
  type: 'primary' | 'foreign' | 'unique' | 'index';
  name: string;
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
  keys: TableKey[];
  sampleRows: Record<string, any>[];
}

export interface SchemaMetadata {
  tables?: Record<string, TableMetadata>;
}

export interface TableMetadata {
  description?: string;
  columns?: Record<string, ColumnMetadata>;
}

export interface ColumnMetadata {
  description?: string;
  synonyms?: string[];
}

@Entity('SchemaSnapshots')
export class SchemaSnapshot {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  dataSourceId!: string;

  @Column({ type: 'timestamp' })
  generatedAt!: Date;

  @Column({ type: 'jsonb' })
  tables!: TableInfo[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: SchemaMetadata;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => DataSource, (dataSource) => dataSource.schemaSnapshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dataSourceId' })
  dataSource!: DataSource;
}

