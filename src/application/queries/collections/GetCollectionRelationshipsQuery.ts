export class GetCollectionRelationshipsQuery {
  collectionId!: string;
  ownerId!: string;
}

export interface IGetCollectionRelationshipsQueryHandler {
  handle(query: GetCollectionRelationshipsQuery): Promise<import('../../dto/responses/RelationshipDto').RelationshipDto[]>;
}

