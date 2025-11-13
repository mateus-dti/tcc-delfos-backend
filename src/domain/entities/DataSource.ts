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

export enum DataSourceType {
  PostgreSQL = 'PostgreSQL',
  MongoDB = 'MongoDB',
}

@Entity('DataSources')
export class DataSource {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  collectionId!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: DataSourceType,
    default: DataSourceType.PostgreSQL,
  })
  type!: DataSourceType;

  @Column({ type: 'text', nullable: true })
  connectionUriEncrypted?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastScannedAt?: Date;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Collection, (collection) => collection.dataSources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collectionId' })
  collection!: Collection;
}

