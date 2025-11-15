export class CreateRelationshipCommand {
  collectionId!: string;
  sourceTable!: string;
  sourceColumn!: string;
  targetTable!: string;
  targetColumn!: string;
  sourceDataSourceId?: string;
  targetDataSourceId?: string;
  ownerId!: string;
}

export interface ICreateRelationshipCommandHandler {
  handle(command: CreateRelationshipCommand): Promise<import('../../dto/responses/RelationshipDto').RelationshipDto>;
}

