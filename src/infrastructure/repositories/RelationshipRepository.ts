import { Repository } from 'typeorm';
import { AppDataSource } from '../data/data-source';
import { Relationship } from '../../domain/entities/Relationship';
import { IRelationshipRepository } from '../../domain/interfaces/IRelationshipRepository';

export class RelationshipRepository implements IRelationshipRepository {
  private repository: Repository<Relationship>;

  constructor() {
    this.repository = AppDataSource.getRepository(Relationship);
  }

  async getById(id: string): Promise<Relationship | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['collection'],
    });
  }

  async getByCollectionId(collectionId: string): Promise<Relationship[]> {
    return await this.repository.find({
      where: { collectionId },
      order: { confidence: 'DESC', createdAt: 'DESC' },
      relations: ['collection'],
    });
  }

  async create(relationship: Relationship): Promise<Relationship> {
    return await this.repository.save(relationship);
  }

  async update(relationship: Relationship): Promise<Relationship> {
    return await this.repository.save(relationship);
  }

  async delete(id: string): Promise<boolean> {
    const relationship = await this.getById(id);
    if (!relationship) {
      return false;
    }

    await this.repository.remove(relationship);
    return true;
  }

  async deleteByCollectionId(collectionId: string): Promise<number> {
    const result = await this.repository.delete({ collectionId });
    return result.affected || 0;
  }
}

