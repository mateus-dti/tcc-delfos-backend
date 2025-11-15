import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRelationshipRequest {
  @IsString()
  @IsNotEmpty()
  sourceTable!: string;

  @IsString()
  @IsNotEmpty()
  sourceColumn!: string;

  @IsString()
  @IsNotEmpty()
  targetTable!: string;

  @IsString()
  @IsNotEmpty()
  targetColumn!: string;

  @IsString()
  @IsOptional()
  sourceDataSourceId?: string;

  @IsString()
  @IsOptional()
  targetDataSourceId?: string;
}

