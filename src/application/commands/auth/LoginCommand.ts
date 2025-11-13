import { LoginResponse } from '../../dto/responses/LoginResponse';

export class LoginCommand {
  username!: string;
  password!: string;
}

export interface ILoginCommandHandler {
  handle(command: LoginCommand): Promise<LoginResponse | null>;
}

