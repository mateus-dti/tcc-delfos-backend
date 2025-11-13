import { CollectionDto } from '../../dto/responses/CollectionDto';
import { PagedResult } from '../../../domain/interfaces/ICollectionRepository';

export class GetAllCollectionsQuery {
  ownerId?: string;
  search?: string; // Busca por nome ou descrição
  orderBy?: 'name' | 'createdAt';
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

export interface IGetAllCollectionsQueryHandler {
  handle(query: GetAllCollectionsQuery): Promise<PagedResult<CollectionDto>>;
}

