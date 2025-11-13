import { Repository } from 'typeorm';
import { AppDataSource } from '../data/data-source';
import { Collection } from '../../domain/entities/Collection';
import { DataSource } from '../../domain/entities/DataSource';
import {
  ICollectionRepository,
  CollectionSearchFilters,
  PagedResult,
} from '../../domain/interfaces/ICollectionRepository';

export class CollectionRepository implements ICollectionRepository {
  private repository: Repository<Collection>;

  constructor() {
    this.repository = AppDataSource.getRepository(Collection);
  }

  async getById(id: string): Promise<Collection | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async getByIdWithDataSources(id: string): Promise<Collection | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['owner', 'dataSources'],
    });
  }

  async getByOwnerId(ownerId: string): Promise<Collection[]> {
    return await this.repository.find({
      where: { ownerId, isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    });
  }

  async getByNameAndOwner(name: string, ownerId: string): Promise<Collection | null> {
    return await this.repository.findOne({
      where: { name, ownerId },
    });
  }

  async getAll(): Promise<Collection[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    });
  }

  async create(collection: Collection): Promise<Collection> {
    collection.createdAt = new Date();
    collection.updatedAt = new Date();
    return await this.repository.save(collection);
  }

  async update(collection: Collection): Promise<Collection> {
    collection.updatedAt = new Date();
    return await this.repository.save(collection);
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getById(id);
    if (!collection) {
      return false;
    }

    collection.isActive = false;
    await this.repository.save(collection);
    return true;
  }

  async existsByNameAndOwner(name: string, ownerId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { name, ownerId, isActive: true },
    });
    return count > 0;
  }

  async search(filters: CollectionSearchFilters): Promise<PagedResult<Collection>> {
    const {
      ownerId,
      search,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
      page = 1,
      pageSize = 10,
    } = filters;

    const queryBuilder = this.repository.createQueryBuilder('collection');

    // Join com owner
    queryBuilder.leftJoinAndSelect('collection.owner', 'owner');

    // Filtro por ownerId
    if (ownerId) {
      queryBuilder.where('collection.ownerId = :ownerId', { ownerId });
    }

    // Filtro por isActive
    queryBuilder.andWhere('collection.isActive = :isActive', { isActive: true });

    // Busca por nome ou descrição
    if (search) {
      queryBuilder.andWhere(
        '(collection.name ILIKE :search OR collection.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Ordenação
    const orderField = orderBy === 'name' ? 'collection.name' : 'collection.createdAt';
    queryBuilder.orderBy(orderField, orderDirection);

    // Paginação
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // Executar query
    const [items, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async countDataSources(collectionId: string): Promise<number> {
    const dataSourceRepo = AppDataSource.getRepository(DataSource);
    return await dataSourceRepo.count({
      where: { collectionId, isActive: true },
    });
  }
}

