import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CollectionAccess } from './CollectionAccess';
import { UserRole } from '../enums/UserRole';

@Entity('Users')
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 100, unique: true })
  username!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 500 })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Default,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @OneToMany(() => CollectionAccess, (access) => access.user)
  collectionAccesses!: CollectionAccess[];
}

