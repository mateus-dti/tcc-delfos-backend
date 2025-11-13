import { UpdateCollectionCommand, IUpdateCollectionCommandHandler } from './UpdateCollectionCommand';
import { CollectionDto } from '../../dto/responses/CollectionDto';
import { Collection } from '../../../domain/entities/Collection';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class UpdateCollectionCommandHandler implements IUpdateCollectionCommandHandler {
  constructor(private collectionRepository: ICollectionRepository) {}

  async handle(command: UpdateCollectionCommand): Promise<CollectionDto> {
    try {
      const collection = await this.collectionRepository.getById(command.id);

      if (!collection) {
        throw new NotFoundException('Coleção', command.id);
      }

      // Check if user is the owner
      if (collection.ownerId !== command.ownerId) {
        throw new ForbiddenException('Você só pode atualizar suas próprias coleções.');
      }

      // Check if new name already exists for this owner (if name is being changed)
      if (command.name && command.name !== collection.name) {
        if (await this.collectionRepository.existsByNameAndOwner(command.name, command.ownerId)) {
          throw new ConflictException(
            `Você já possui uma coleção com o nome '${command.name}'. Por favor, escolha outro nome.`,
            'name'
          );
        }
        collection.name = command.name;
      }

      if (command.description !== undefined) {
        collection.description = command.description;
      }

      const updatedCollection = await this.collectionRepository.update(collection);
      return this.mapToCollectionDto(updatedCollection);
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao atualizar coleção. Por favor, tente novamente.',
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

