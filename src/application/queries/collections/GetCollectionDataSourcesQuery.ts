import { DataSourceDto } from '../../dto/responses/DataSourceDto';

export class GetCollectionDataSourcesQuery {
  collectionId!: string;
  userId!: string; // Para validação de permissão
}

export interface IGetCollectionDataSourcesQueryHandler {
  handle(query: GetCollectionDataSourcesQuery): Promise<DataSourceDto[]>;
}

