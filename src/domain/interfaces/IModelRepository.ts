import { Model, ModelOrigin } from '../entities/Model';

/**
 * Interface para repositório de Models
 * RF04.1 - CRUD de modelos de IA
 */
export interface IModelRepository {
  getById(id: string): Promise<Model | null>;
  getByIdentifier(identifier: string): Promise<Model | null>;
  getAll(): Promise<Model[]>;
  getAllByOrigin(origin: ModelOrigin): Promise<Model[]>;
  searchByName(searchTerm: string): Promise<Model[]>;
  create(model: Model): Promise<Model>;
  update(model: Model): Promise<Model>;
  delete(id: string): Promise<boolean>;
  existsByIdentifier(identifier: string): Promise<boolean>;
}
