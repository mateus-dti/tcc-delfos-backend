import { Repository } from 'typeorm';
import { AppDataSource } from '../data/data-source';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async getById(id: string): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async getByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({ where: { username } });
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async getAll(): Promise<User[]> {
    return await this.repository.find({
      order: { username: 'ASC' },
    });
  }

  async create(user: User): Promise<User> {
    user.createdAt = new Date();
    return await this.repository.save(user);
  }

  async update(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.getById(id);
    if (!user) {
      return false;
    }

    user.isActive = false;
    await this.repository.save(user);
    return true;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repository.count({ where: { username } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }
}

