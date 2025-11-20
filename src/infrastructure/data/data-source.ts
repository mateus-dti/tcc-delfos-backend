import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/User';
import { CollectionAccess } from '../../domain/entities/CollectionAccess';
import { Collection } from '../../domain/entities/Collection';
import { DataSource as DataSourceEntity } from '../../domain/entities/DataSource';
import { SchemaSnapshot } from '../../domain/entities/SchemaSnapshot';
import { Relationship } from '../../domain/entities/Relationship';
import { Model } from '../../domain/entities/Model';

// Configuração SSL para Supabase
const isSupabase = process.env.DB_HOST?.includes('supabase') || false;
const sslConfig = isSupabase
  ? {
      rejectUnauthorized: false, // Supabase usa certificados auto-assinados
    }
  : false;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'delfos',
  password: process.env.DB_PASSWORD || 'delfos_password',
  database: process.env.DB_DATABASE || 'delfos_metadata',
  ssl: sslConfig,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, CollectionAccess, Collection, DataSourceEntity, SchemaSnapshot, Relationship, Model],
  migrations: ['src/infrastructure/data/migrations/**/*.ts'],
  subscribers: ['src/infrastructure/data/subscribers/**/*.ts'],
  extra: {
    // Timeout de conexão aumentado para Supabase
    connectionTimeoutMillis: 10000,
    // Pool de conexões
    max: 20,
    idleTimeoutMillis: 30000,
  },
});

