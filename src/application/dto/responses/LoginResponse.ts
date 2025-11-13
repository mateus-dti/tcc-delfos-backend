import { UserDto } from './UserDto';

export class LoginResponse {
  token!: string;
  expiresAt!: Date;
  user!: UserDto;
}

