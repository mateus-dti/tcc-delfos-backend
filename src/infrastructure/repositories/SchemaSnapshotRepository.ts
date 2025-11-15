import { Repository } from 'typeorm';
import { AppDataSource } from '../data/data-source';
import { SchemaSnapshot } from '../../domain/entities/SchemaSnapshot';
import { ISchemaSnapshotRepository } from '../../domain/interfaces/ISchemaSnapshotRepository';

export class SchemaSnapshotRepository implements ISchemaSnapshotRepository {
  private repository: Repository<SchemaSnapshot>;

  constructor() {
    this.repository = AppDataSource.getRepository(SchemaSnapshot);
  }

  async getById(id: string): Promise<SchemaSnapshot | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['dataSource'],
    });
  }

  async getByDataSourceId(dataSourceId: string): Promise<SchemaSnapshot[]> {
    return await this.repository.find({
      where: { dataSourceId },
      order: { generatedAt: 'DESC' },
      relations: ['dataSource'],
    });
  }

  async getLatestByDataSourceId(dataSourceId: string): Promise<SchemaSnapshot | null> {
    return await this.repository.findOne({
      where: { dataSourceId },
      order: { generatedAt: 'DESC', version: 'DESC' },
      relations: ['dataSource'],
    });
  }

  async create(snapshot: SchemaSnapshot): Promise<SchemaSnapshot> {
    snapshot.createdAt = new Date();
    return await this.repository.save(snapshot);
  }

  async update(snapshot: SchemaSnapshot): Promise<SchemaSnapshot> {
    return await this.repository.save(snapshot);
  }

  async delete(id: string): Promise<boolean> {
    const snapshot = await this.getById(id);
    if (!snapshot) {
      return false;
    }

    await this.repository.remove(snapshot);
    return true;
  }
}

