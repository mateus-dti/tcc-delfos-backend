import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';

export class UpdateRelationshipRequest {
  @IsString()
  @IsOptional()
  sourceTable?: string;

  @IsString()
  @IsOptional()
  sourceColumn?: string;

  @IsString()
  @IsOptional()
  targetTable?: string;

  @IsString()
  @IsOptional()
  targetColumn?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  confidence?: number;

  @IsBoolean()
  @IsOptional()
  manualOverride?: boolean;
}

