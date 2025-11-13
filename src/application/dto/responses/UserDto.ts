import { UserRole } from '../../domain/enums/UserRole';

export class UserDto {
  id!: string;
  username!: string;
  email!: string;
  role!: UserRole;
  isActive!: boolean;
  createdAt!: Date;
  lastLoginAt?: Date;
}

