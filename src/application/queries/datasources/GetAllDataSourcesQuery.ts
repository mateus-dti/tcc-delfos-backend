export class GetAllDataSourcesQuery {
  ownerId!: string;
  collectionId?: string;
}

export interface IGetAllDataSourcesQueryHandler {
  handle(query: GetAllDataSourcesQuery): Promise<import('../../dto/responses/DataSourceDto').DataSourceDto[]>;
}

