export class GetDataSourceQuery {
  id!: string;
  ownerId!: string;
}

export interface IGetDataSourceQueryHandler {
  handle(query: GetDataSourceQuery): Promise<import('../../dto/responses/DataSourceDto').DataSourceDto>;
}

