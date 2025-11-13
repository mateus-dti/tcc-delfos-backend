import { CollectionDto } from '../../dto/responses/CollectionDto';

export class CreateCollectionCommand {
  name!: string;
  description?: string;
  ownerId!: string;
}

export interface ICreateCollectionCommandHandler {
  handle(command: CreateCollectionCommand): Promise<CollectionDto>;
}

