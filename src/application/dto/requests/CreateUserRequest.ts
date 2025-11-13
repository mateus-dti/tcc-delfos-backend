import { IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';

export class CreateUserRequest {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @MaxLength(100, { message: 'Username must not exceed 100 characters' })
  username!: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password!: string;
}

