import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Collection } from './Collection';

@Entity('Relationships')
export class Relationship {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  collectionId!: string;

  @Column({ length: 255 })
  sourceTable!: string;

  @Column({ length: 255 })
  sourceColumn!: string;

  @Column({ length: 255 })
  targetTable!: string;

  @Column({ length: 255 })
  targetColumn!: string;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  confidence!: number; // 0.00 a 1.00

  @Column({ default: false })
  manualOverride!: boolean; // Se foi confirmado manualmente pelo usuário

  @Column({ type: 'text', nullable: true })
  sourceDataSourceId?: string; // ID da fonte de dados de origem

  @Column({ type: 'text', nullable: true })
  targetDataSourceId?: string; // ID da fonte de dados de destino

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Collection, (collection) => collection.relationships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collectionId' })
  collection!: Collection;
}

