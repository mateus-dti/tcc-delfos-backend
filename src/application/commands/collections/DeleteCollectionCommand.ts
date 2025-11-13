export class DeleteCollectionCommand {
  id!: string;
  ownerId!: string; // Used for authorization check
}

export interface IDeleteCollectionCommandHandler {
  handle(command: DeleteCollectionCommand): Promise<boolean>;
}

