export class DataSourceDto {
  id!: string;
  collectionId!: string;
  name!: string;
  type!: string;
  connectionUriEncrypted?: string;
  metadata?: Record<string, any>;
  lastScannedAt?: Date;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

