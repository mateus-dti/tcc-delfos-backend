import { CollectionDto } from '../../dto/responses/CollectionDto';

export class GetCollectionQuery {
  id!: string;
}

export interface IGetCollectionQueryHandler {
  handle(query: GetCollectionQuery): Promise<CollectionDto | null>;
}

