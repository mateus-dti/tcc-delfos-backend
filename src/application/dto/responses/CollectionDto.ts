import { DataSourceDto } from './DataSourceDto';

export class CollectionDto {
  id!: string;
  name!: string;
  description?: string;
  ownerId!: string;
  owner?: {
    id: string;
    username: string;
    email: string;
  };
  dataSourcesCount?: number;
  dataSources?: DataSourceDto[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class CollectionDetailsDto extends CollectionDto {
  dataSources!: DataSourceDto[];
}

