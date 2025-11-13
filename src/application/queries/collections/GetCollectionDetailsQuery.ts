import { CollectionDetailsDto } from '../../dto/responses/CollectionDto';

export class GetCollectionDetailsQuery {
  id!: string;
  userId!: string; // Para validação de permissão
}

export interface IGetCollectionDetailsQueryHandler {
  handle(query: GetCollectionDetailsQuery): Promise<CollectionDetailsDto | null>;
}

