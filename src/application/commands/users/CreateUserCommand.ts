import { UserDto } from '../../dto/responses/UserDto';
import { UserRole } from '../../../domain/enums/UserRole';

export class CreateUserCommand {
  username!: string;
  email!: string;
  password!: string;
  role?: UserRole;
}

export interface ICreateUserCommandHandler {
  handle(command: CreateUserCommand): Promise<UserDto>;
}

