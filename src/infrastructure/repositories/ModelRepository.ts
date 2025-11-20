import { Repository } from 'typeorm';
import { AppDataSource } from '../data/data-source';
import { Model, ModelOrigin } from '../../domain/entities/Model';
import { IModelRepository } from '../../domain/interfaces/IModelRepository';

export class ModelRepository implements IModelRepository {
  private repository: Repository<Model>;

  constructor() {
    this.repository = AppDataSource.getRepository(Model);
  }

  async getById(id: string): Promise<Model | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async getByIdentifier(identifier: string): Promise<Model | null> {
    return await this.repository.findOne({ where: { identifier } });
  }

  async getAll(): Promise<Model[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getAllByOrigin(origin: ModelOrigin): Promise<Model[]> {
    return await this.repository.find({
      where: { isActive: true, origin },
      order: { name: 'ASC' },
    });
  }

  async searchByName(searchTerm: string): Promise<Model[]> {
    return await this.repository
      .createQueryBuilder('model')
      .where('model.isActive = :isActive', { isActive: true })
      .andWhere(
        '(LOWER(model.name) LIKE LOWER(:search) OR LOWER(model.identifier) LIKE LOWER(:search) OR LOWER(model.description) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` }
      )
      .orderBy('model.name', 'ASC')
      .getMany();
  }

  async create(model: Model): Promise<Model> {
    return await this.repository.save(model);
  }

  async update(model: Model): Promise<Model> {
    return await this.repository.save(model);
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getById(id);
    if (!model) {
      return false;
    }

    model.isActive = false;
    await this.repository.save(model);
    return true;
  }

  async existsByIdentifier(identifier: string): Promise<boolean> {
    const count = await this.repository.count({ where: { identifier } });
    return count > 0;
  }
}
