import { UserDto } from '../../dto/responses/UserDto';

export class UpdateUserCommand {
  id!: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface IUpdateUserCommandHandler {
  handle(command: UpdateUserCommand): Promise<UserDto>;
}

