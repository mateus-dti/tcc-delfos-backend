import { randomUUID } from 'crypto';
import { DiscoverRelationshipsCommand, IDiscoverRelationshipsCommandHandler } from './DiscoverRelationshipsCommand';
import { RelationshipDto } from '../../dto/responses/RelationshipDto';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { IRelationshipRepository } from '../../../domain/interfaces/IRelationshipRepository';
import { RelationshipDiscoveryService } from '../../../infrastructure/services/RelationshipDiscoveryService';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';
import { Relationship } from '../../../domain/entities/Relationship';

export class DiscoverRelationshipsCommandHandler implements IDiscoverRelationshipsCommandHandler {
  constructor(
    private collectionRepository: ICollectionRepository,
    private relationshipRepository: IRelationshipRepository,
    private relationshipDiscoveryService: RelationshipDiscoveryService
  ) {}

  async handle(command: DiscoverRelationshipsCommand): Promise<RelationshipDto[]> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(command.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', command.collectionId);
      }

      // Verificar se o usuário é o dono da coleção
      if (collection.ownerId !== command.ownerId) {
        throw new ForbiddenException(
          'Você não tem permissão para descobrir relacionamentos nesta coleção.'
        );
      }

      // Descobrir relacionamentos usando heurísticas
      const candidates = await this.relationshipDiscoveryService.discoverRelationships(
        command.collectionId
      );

      // Remover relacionamentos existentes da coleção (para re-descoberta)
      await this.relationshipRepository.deleteByCollectionId(command.collectionId);

      // Criar relacionamentos no banco de dados
      const relationships: Relationship[] = [];
      for (const candidate of candidates) {
        const relationship = new Relationship();
        relationship.id = randomUUID();
        relationship.collectionId = command.collectionId;
        relationship.sourceTable = candidate.sourceTable;
        relationship.sourceColumn = candidate.sourceColumn;
        relationship.targetTable = candidate.targetTable;
        relationship.targetColumn = candidate.targetColumn;
        relationship.confidence = candidate.confidence;
        relationship.manualOverride = false;
        relationship.sourceDataSourceId = candidate.sourceDataSourceId;
        relationship.targetDataSourceId = candidate.targetDataSourceId;

        const created = await this.relationshipRepository.create(relationship);
        relationships.push(created);
      }

      // Converter para DTOs
      return relationships.map((r) => this.mapToDto(r));
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao descobrir relacionamentos. Por favor, tente novamente.',
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

