import { CollectionDto } from '../../dto/responses/CollectionDto';

export class UpdateCollectionCommand {
  id!: string;
  name?: string;
  description?: string;
  ownerId!: string; // Used for authorization check
}

export interface IUpdateCollectionCommandHandler {
  handle(command: UpdateCollectionCommand): Promise<CollectionDto>;
}

