export class GetDataSourceSchemaQuery {
  dataSourceId!: string;
  ownerId!: string;
  version?: number; // Se não fornecido, retorna o mais recente
}

export interface IGetDataSourceSchemaQueryHandler {
  handle(query: GetDataSourceSchemaQuery): Promise<import('../../dto/responses/DataSourceSchemaDto').DataSourceSchemaDto>;
}

