import { UserDto } from '../../dto/responses/UserDto';

export class CreateUserCommand {
  username!: string;
  email!: string;
  password!: string;
}

export interface ICreateUserCommandHandler {
  handle(command: CreateUserCommand): Promise<UserDto>;
}

