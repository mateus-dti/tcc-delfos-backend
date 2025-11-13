import { Collection } from '../entities/Collection';

export interface CollectionSearchFilters {
  ownerId?: string;
  search?: string; // Busca por nome ou descrição
  orderBy?: 'name' | 'createdAt';
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ICollectionRepository {
  getById(id: string): Promise<Collection | null>;
  getByIdWithDataSources(id: string): Promise<Collection | null>;
  getByOwnerId(ownerId: string): Promise<Collection[]>;
  getByNameAndOwner(name: string, ownerId: string): Promise<Collection | null>;
  getAll(): Promise<Collection[]>;
  search(filters: CollectionSearchFilters): Promise<PagedResult<Collection>>;
  countDataSources(collectionId: string): Promise<number>;
  create(collection: Collection): Promise<Collection>;
  update(collection: Collection): Promise<Collection>;
  delete(id: string): Promise<boolean>;
  existsByNameAndOwner(name: string, ownerId: string): Promise<boolean>;
}

