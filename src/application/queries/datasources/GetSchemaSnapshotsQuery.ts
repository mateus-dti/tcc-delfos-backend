export class GetSchemaSnapshotsQuery {
  dataSourceId!: string;
  ownerId!: string;
}

export interface IGetSchemaSnapshotsQueryHandler {
  handle(query: GetSchemaSnapshotsQuery): Promise<import('../../dto/responses/SchemaSnapshotDto').SchemaSnapshotDto[]>;
}

