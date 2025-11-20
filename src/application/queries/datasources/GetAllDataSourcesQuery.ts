export class GetAllDataSourcesQuery {
  ownerId!: string;
  collectionId?: string;
}

export interface IGetAllDataSourcesQueryHandler {
  handle(query: GetAllDataSourcesQuery): Promise<{
    items: import('../../dto/responses/DataSourceDto').DataSourceDto[];
    total: number;
  }>;
}

