export class DeleteUserCommand {
  id!: string;
}

export interface IDeleteUserCommandHandler {
  handle(command: DeleteUserCommand): Promise<boolean>;
}

