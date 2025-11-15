import { randomUUID } from 'crypto';
import { CreateRelationshipCommand, ICreateRelationshipCommandHandler } from './CreateRelationshipCommand';
import { RelationshipDto } from '../../dto/responses/RelationshipDto';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { IRelationshipRepository } from '../../../domain/interfaces/IRelationshipRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';
import { Relationship } from '../../../domain/entities/Relationship';

export class CreateRelationshipCommandHandler implements ICreateRelationshipCommandHandler {
  constructor(
    private collectionRepository: ICollectionRepository,
    private relationshipRepository: IRelationshipRepository
  ) {}

  async handle(command: CreateRelationshipCommand): Promise<RelationshipDto> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(command.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', command.collectionId);
      }

      // Verificar se o usuário é o dono da coleção
      if (collection.ownerId !== command.ownerId) {
        throw new ForbiddenException(
          'Você não tem permissão para criar relacionamentos nesta coleção.'
        );
      }

      // Criar relacionamento
      const relationship = new Relationship();
      relationship.id = randomUUID();
      relationship.collectionId = command.collectionId;
      relationship.sourceTable = command.sourceTable;
      relationship.sourceColumn = command.sourceColumn;
      relationship.targetTable = command.targetTable;
      relationship.targetColumn = command.targetColumn;
      relationship.confidence = 1.0; // Relacionamento manual tem confiança máxima
      relationship.manualOverride = true; // Marcado como manual
      relationship.sourceDataSourceId = command.sourceDataSourceId;
      relationship.targetDataSourceId = command.targetDataSourceId;

      const created = await this.relationshipRepository.create(relationship);

      return this.mapToDto(created);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao criar relacionamento. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToDto(relationship: Relationship): RelationshipDto {
    return {
      id: relationship.id,
      collectionId: relationship.collectionId,
      sourceTable: relationship.sourceTable,
      sourceColumn: relationship.sourceColumn,
      targetTable: relationship.targetTable,
      targetColumn: relationship.targetColumn,
      confidence: Number(relationship.confidence),
      manualOverride: relationship.manualOverride,
      sourceDataSourceId: relationship.sourceDataSourceId,
      targetDataSourceId: relationship.targetDataSourceId,
      createdAt: relationship.createdAt,
      updatedAt: relationship.updatedAt,
    };
  }
}

