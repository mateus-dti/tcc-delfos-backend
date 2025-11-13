import { DeleteUserCommand, IDeleteUserCommandHandler } from './DeleteUserCommand';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class DeleteUserCommandHandler implements IDeleteUserCommandHandler {
  constructor(private userRepository: IUserRepository) {}

  async handle(command: DeleteUserCommand): Promise<boolean> {
    try {
      const user = await this.userRepository.getById(command.id);
      
      if (!user) {
        throw new NotFoundException('Usuário', command.id);
      }

      const deleted = await this.userRepository.delete(command.id);
      
      if (!deleted) {
        throw new DatabaseException('Erro ao excluir usuário. Tente novamente.');
      }

      return deleted;
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (error instanceof NotFoundException || error instanceof DatabaseException) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao excluir usuário. Por favor, tente novamente.',
        error
      );
    }
  }
}

