import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { DataSourceType } from '../../../domain/entities/DataSource';

export class AssociateDataSourceRequest {
  @IsString()
  @IsNotEmpty({ message: 'O nome da fonte de dados é obrigatório.' })
  name!: string;

  @IsEnum(DataSourceType, { message: 'O tipo deve ser PostgreSQL ou MongoDB.' })
  @IsNotEmpty({ message: 'O tipo da fonte de dados é obrigatório.' })
  type!: DataSourceType;

  @IsString()
  @IsOptional()
  connectionUriEncrypted?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

