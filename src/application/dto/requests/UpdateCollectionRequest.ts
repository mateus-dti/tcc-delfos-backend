import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateCollectionRequest {
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

