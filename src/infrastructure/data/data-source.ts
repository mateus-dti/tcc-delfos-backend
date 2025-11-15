import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/User';
import { CollectionAccess } from '../../domain/entities/CollectionAccess';
import { Collection } from '../../domain/entities/Collection';
import { DataSource as DataSourceEntity } from '../../domain/entities/DataSource';
import { SchemaSnapshot } from '../../domain/entities/SchemaSnapshot';
import { Relationship } from '../../domain/entities/Relationship';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'delfos',
  password: process.env.DB_PASSWORD || 'delfos_password',
  database: process.env.DB_DATABASE || 'delfos_metadata',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, CollectionAccess, Collection, DataSourceEntity, SchemaSnapshot, Relationship],
  migrations: ['src/infrastructure/data/migrations/**/*.ts'],
  subscribers: ['src/infrastructure/data/subscribers/**/*.ts'],
});

