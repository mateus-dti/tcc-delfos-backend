export class ExtractSchemaCommand {
  dataSourceId!: string;
  ownerId!: string;
}

export interface IExtractSchemaCommandHandler {
  handle(command: ExtractSchemaCommand): Promise<import('../../dto/responses/SchemaSnapshotDto').SchemaSnapshotDto>;
}

