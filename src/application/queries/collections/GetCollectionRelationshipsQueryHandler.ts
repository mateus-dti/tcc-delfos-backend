import { GetCollectionRelationshipsQuery, IGetCollectionRelationshipsQueryHandler } from './GetCollectionRelationshipsQuery';
import { RelationshipDto } from '../../dto/responses/RelationshipDto';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { IRelationshipRepository } from '../../../domain/interfaces/IRelationshipRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class GetCollectionRelationshipsQueryHandler implements IGetCollectionRelationshipsQueryHandler {
  constructor(
    private collectionRepository: ICollectionRepository,
    private relationshipRepository: IRelationshipRepository
  ) {}

  async handle(query: GetCollectionRelationshipsQuery): Promise<RelationshipDto[]> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(query.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', query.collectionId);
      }

      // Verificar se o usuário é o dono da coleção
      if (collection.ownerId !== query.ownerId) {
        throw new ForbiddenException(
          'Você não tem permissão para visualizar relacionamentos desta coleção.'
        );
      }

      // Obter todos os relacionamentos da coleção
      const relationships = await this.relationshipRepository.getByCollectionId(query.collectionId);

      return relationships.map((r) => this.mapToDto(r));
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao obter relacionamentos. Por favor, tente novamente.',
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

