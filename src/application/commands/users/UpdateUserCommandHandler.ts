import { UpdateUserCommand, IUpdateUserCommandHandler } from './UpdateUserCommand';
import { UserDto } from '../../dto/responses/UserDto';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { IPasswordHasherService } from '../../../domain/interfaces/IPasswordHasherService';
import { UserRole } from '../../../domain/enums/UserRole';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { ValidationException } from '../../../domain/exceptions/ValidationException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class UpdateUserCommandHandler implements IUpdateUserCommandHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasherService
  ) {}

  async handle(command: UpdateUserCommand): Promise<UserDto> {
    try {
      const user = await this.userRepository.getById(command.id);

      if (!user) {
        throw new NotFoundException('Usuário', command.id);
      }

      // Update email if provided
      if (command.email && command.email.trim().length > 0) {
        if (await this.userRepository.existsByEmail(command.email) && user.email !== command.email) {
          throw new ConflictException(
            `O email '${command.email}' já está em uso por outro usuário. Por favor, escolha outro email.`,
            'email'
          );
        }
        user.email = command.email;
      }

      // Update password if provided
      if (command.password && command.password.trim().length > 0) {
        if (command.password.length < 6) {
          throw new ValidationException('A senha deve ter pelo menos 6 caracteres');
        }
        user.passwordHash = this.passwordHasher.hashPassword(command.password);
      }

      // Update role if provided
      if (command.role !== undefined) {
        user.role = command.role;
      }

      // Update IsActive if provided
      if (command.isActive !== undefined) {
        user.isActive = command.isActive;
      }

      const updatedUser = await this.userRepository.update(user);
      return this.mapToUserDto(updatedUser);
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao atualizar usuário. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToUserDto(user: any): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}

