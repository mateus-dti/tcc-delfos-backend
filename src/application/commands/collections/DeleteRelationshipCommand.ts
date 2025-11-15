export class DeleteRelationshipCommand {
  relationshipId!: string;
  collectionId!: string;
  ownerId!: string;
}

export interface IDeleteRelationshipCommandHandler {
  handle(command: DeleteRelationshipCommand): Promise<void>;
}

