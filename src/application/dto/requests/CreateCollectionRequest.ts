import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateCollectionRequest {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

