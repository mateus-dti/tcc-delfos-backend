import { UpdateRelationshipCommand, IUpdateRelationshipCommandHandler } from './UpdateRelationshipCommand';
import { RelationshipDto } from '../../dto/responses/RelationshipDto';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { IRelationshipRepository } from '../../../domain/interfaces/IRelationshipRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';
import { ValidationException } from '../../../domain/exceptions/ValidationException';

export class UpdateRelationshipCommandHandler implements IUpdateRelationshipCommandHandler {
  constructor(
    private collectionRepository: ICollectionRepository,
    private relationshipRepository: IRelationshipRepository
  ) {}

  async handle(command: UpdateRelationshipCommand): Promise<RelationshipDto> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(command.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', command.collectionId);
      }

      // Verificar se o usuário é o dono da coleção
      if (collection.ownerId !== command.ownerId) {
        throw new ForbiddenException(
          'Você não tem permissão para editar relacionamentos nesta coleção.'
        );
      }

      // Buscar relacionamento
      const relationship = await this.relationshipRepository.getById(command.relationshipId);
      if (!relationship) {
        throw new NotFoundException('Relacionamento', command.relationshipId);
      }

      // Verificar se o relacionamento pertence à coleção
      if (relationship.collectionId !== command.collectionId) {
        throw new ValidationException('O relacionamento não pertence a esta coleção.');
      }

      // Atualizar campos fornecidos
      if (command.sourceTable !== undefined) {
        relationship.sourceTable = command.sourceTable;
      }
      if (command.sourceColumn !== undefined) {
        relationship.sourceColumn = command.sourceColumn;
      }
      if (command.targetTable !== undefined) {
        relationship.targetTable = command.targetTable;
      }
      if (command.targetColumn !== undefined) {
        relationship.targetColumn = command.targetColumn;
      }
      if (command.confidence !== undefined) {
        if (command.confidence < 0 || command.confidence > 1) {
          throw new ValidationException('A confiança deve estar entre 0 e 1.');
        }
        relationship.confidence = command.confidence;
      }
      if (command.manualOverride !== undefined) {
        relationship.manualOverride = command.manualOverride;
      }

      const updated = await this.relationshipRepository.update(relationship);

      return this.mapToDto(updated);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao atualizar relacionamento. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToDto(relationship: import('../../../domain/entities/Relationship').Relationship): RelationshipDto {
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

