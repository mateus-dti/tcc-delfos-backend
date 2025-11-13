import { UserDto } from '../../dto/responses/UserDto';
import { UserRole } from '../../../domain/enums/UserRole';

export class UpdateUserCommand {
  id!: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface IUpdateUserCommandHandler {
  handle(command: UpdateUserCommand): Promise<UserDto>;
}

