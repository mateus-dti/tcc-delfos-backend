import { Relationship } from '../entities/Relationship';

export interface IRelationshipRepository {
  getById(id: string): Promise<Relationship | null>;
  getByCollectionId(collectionId: string): Promise<Relationship[]>;
  create(relationship: Relationship): Promise<Relationship>;
  update(relationship: Relationship): Promise<Relationship>;
  delete(id: string): Promise<boolean>;
  deleteByCollectionId(collectionId: string): Promise<number>; // Retorna quantidade deletada
}

