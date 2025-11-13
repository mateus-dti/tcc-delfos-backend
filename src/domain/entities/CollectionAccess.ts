import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Collection } from './Collection';
import { AccessPermission } from '../enums/AccessPermission';

@Entity('CollectionAccesses')
export class CollectionAccess {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  collectionId!: string;

  @Column('uuid')
  userId!: string;

  @Column({
    type: 'enum',
    enum: AccessPermission,
  })
  permission!: AccessPermission;

  @CreateDateColumn()
  grantedAt!: Date;

  @Column('uuid')
  grantedBy!: string;

  @ManyToOne(() => User, (user) => user.collectionAccesses)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Collection, (collection) => collection.accesses)
  @JoinColumn({ name: 'collectionId' })
  collection!: Collection;
}

