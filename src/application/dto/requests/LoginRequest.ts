import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @MaxLength(100, { message: 'Username must not exceed 100 characters' })
  username!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password!: string;
}

