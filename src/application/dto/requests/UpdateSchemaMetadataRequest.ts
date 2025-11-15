import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SchemaMetadata } from '../../../domain/entities/SchemaSnapshot';

export class UpdateSchemaMetadataRequest {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  metadata?: SchemaMetadata;
}

