import { IsOptional, IsString, IsEmail, IsBoolean, MaxLength, IsEnum } from 'class-validator';
import { UserRole } from '../../../domain/enums/UserRole';

export class UpdateUserRequest {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: default, manager, admin' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

