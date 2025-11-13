export class DisassociateDataSourceFromCollectionCommand {
  collectionId!: string;
  dataSourceId!: string;
  ownerId!: string; // Para validação de permissão
}

export interface IDisassociateDataSourceFromCollectionCommandHandler {
  handle(command: DisassociateDataSourceFromCollectionCommand): Promise<boolean>;
}

