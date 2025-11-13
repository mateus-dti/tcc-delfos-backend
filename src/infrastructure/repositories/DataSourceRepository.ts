import { Repository } from 'typeorm';
import { AppDataSource } from '../data/data-source';
import { DataSource as DataSourceEntity } from '../../domain/entities/DataSource';
import { IDataSourceRepository } from '../../domain/interfaces/IDataSourceRepository';

export class DataSourceRepository implements IDataSourceRepository {
  private repository: Repository<DataSourceEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(DataSourceEntity);
  }

  async getById(id: string): Promise<DataSourceEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['collection'],
    });
  }

  async getByCollectionId(collectionId: string): Promise<DataSourceEntity[]> {
    return await this.repository.find({
      where: { collectionId, isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['collection'],
    });
  }

  async getByNameAndCollection(name: string, collectionId: string): Promise<DataSourceEntity | null> {
    return await this.repository.findOne({
      where: { name, collectionId, isActive: true },
    });
  }

  async create(dataSource: DataSourceEntity): Promise<DataSourceEntity> {
    dataSource.createdAt = new Date();
    dataSource.updatedAt = new Date();
    return await this.repository.save(dataSource);
  }

  async update(dataSource: DataSourceEntity): Promise<DataSourceEntity> {
    dataSource.updatedAt = new Date();
    return await this.repository.save(dataSource);
  }

  async delete(id: string): Promise<boolean> {
    const dataSource = await this.getById(id);
    if (!dataSource) {
      return false;
    }

    dataSource.isActive = false;
    await this.repository.save(dataSource);
    return true;
  }

  async existsByNameAndCollection(name: string, collectionId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { name, collectionId, isActive: true },
    });
    return count > 0;
  }

  async existsByIdAndCollection(id: string, collectionId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { id, collectionId, isActive: true },
    });
    return count > 0;
  }
}

