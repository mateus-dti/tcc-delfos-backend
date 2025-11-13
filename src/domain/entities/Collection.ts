import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { CollectionAccess } from './CollectionAccess';
import { DataSource } from './DataSource';

@Entity('Collections')
export class Collection {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('uuid')
  ownerId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @OneToMany(() => CollectionAccess, (access) => access.collection)
  accesses!: CollectionAccess[];

  @OneToMany(() => DataSource, (dataSource) => dataSource.collection)
  dataSources!: DataSource[];
}

