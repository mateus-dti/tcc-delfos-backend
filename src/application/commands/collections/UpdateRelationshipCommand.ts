export class UpdateRelationshipCommand {
  relationshipId!: string;
  collectionId!: string;
  sourceTable?: string;
  sourceColumn?: string;
  targetTable?: string;
  targetColumn?: string;
  confidence?: number;
  manualOverride?: boolean;
  ownerId!: string;
}

export interface IUpdateRelationshipCommandHandler {
  handle(command: UpdateRelationshipCommand): Promise<import('../../dto/responses/RelationshipDto').RelationshipDto>;
}

