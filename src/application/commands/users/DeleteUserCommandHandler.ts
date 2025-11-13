import { DeleteUserCommand, IDeleteUserCommandHandler } from './DeleteUserCommand';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';

export class DeleteUserCommandHandler implements IDeleteUserCommandHandler {
  constructor(private userRepository: IUserRepository) {}

  async handle(command: DeleteUserCommand): Promise<boolean> {
    return await this.userRepository.delete(command.id);
  }
}

