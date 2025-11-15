import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { DataSourceType } from '../../../domain/entities/DataSource';

export class CreateDataSourceRequest {
  @IsString()
  @IsNotEmpty({ message: 'O nome da fonte de dados é obrigatório.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'O ID da coleção é obrigatório.' })
  collectionId!: string;

  @IsEnum(DataSourceType, { message: 'O tipo deve ser PostgreSQL ou MongoDB.' })
  @IsNotEmpty({ message: 'O tipo da fonte de dados é obrigatório.' })
  type!: DataSourceType;

  @IsString()
  @IsNotEmpty({ message: 'A URI de conexão é obrigatória.' })
  connectionUri!: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

