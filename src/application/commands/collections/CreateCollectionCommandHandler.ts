import { randomUUID } from 'crypto';
import { CreateCollectionCommand, ICreateCollectionCommandHandler } from './CreateCollectionCommand';
import { CollectionDto } from '../../dto/responses/CollectionDto';
import { Collection } from '../../../domain/entities/Collection';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class CreateCollectionCommandHandler implements ICreateCollectionCommandHandler {
  constructor(private collectionRepository: ICollectionRepository) {}

  async handle(command: CreateCollectionCommand): Promise<CollectionDto> {
    try {
      // Check if collection name already exists for this owner
      if (await this.collectionRepository.existsByNameAndOwner(command.name, command.ownerId)) {
        throw new ConflictException(
          `Você já possui uma coleção com o nome '${command.name}'. Por favor, escolha outro nome.`,
          'name'
        );
      }

      const collection = new Collection();
      collection.id = randomUUID();
      collection.name = command.name;
      collection.description = command.description;
      collection.ownerId = command.ownerId;
      collection.isActive = true;

      const createdCollection = await this.collectionRepository.create(collection);
      return this.mapToCollectionDto(createdCollection);
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (error instanceof ConflictException) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao criar coleção. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToCollectionDto(collection: Collection): CollectionDto {
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      ownerId: collection.ownerId,
      owner: collection.owner
        ? {
            id: collection.owner.id,
            username: collection.owner.username,
            email: collection.owner.email,
          }
        : undefined,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }
}

