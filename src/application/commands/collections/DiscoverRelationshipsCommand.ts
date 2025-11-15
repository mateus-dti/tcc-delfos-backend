export class DiscoverRelationshipsCommand {
  collectionId!: string;
  ownerId!: string;
}

export interface IDiscoverRelationshipsCommandHandler {
  handle(command: DiscoverRelationshipsCommand): Promise<import('../../dto/responses/RelationshipDto').RelationshipDto[]>;
}

