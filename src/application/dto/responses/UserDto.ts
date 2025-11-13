export class UserDto {
  id!: string;
  username!: string;
  email!: string;
  isActive!: boolean;
  createdAt!: Date;
  lastLoginAt?: Date;
}

