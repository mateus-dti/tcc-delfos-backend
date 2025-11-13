import { randomUUID } from 'crypto';
import { CreateUserCommand, ICreateUserCommandHandler } from './CreateUserCommand';
import { UserDto } from '../../dto/responses/UserDto';
import { User } from '../../../domain/entities/User';
import { UserRole } from '../../../domain/enums/UserRole';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { IPasswordHasherService } from '../../../domain/interfaces/IPasswordHasherService';
import { ConflictException } from '../../../domain/exceptions/ConflictException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class CreateUserCommandHandler implements ICreateUserCommandHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasherService
  ) {}

  async handle(command: CreateUserCommand): Promise<UserDto> {
    try {
      // Check if username already exists
      if (await this.userRepository.existsByUsername(command.username)) {
        throw new ConflictException(
          `O nome de usuário '${command.username}' já está em uso. Por favor, escolha outro nome.`,
          'username'
        );
      }

      // Check if email already exists
      if (await this.userRepository.existsByEmail(command.email)) {
        throw new ConflictException(
          `O email '${command.email}' já está cadastrado. Por favor, use outro email ou faça login.`,
          'email'
        );
      }

      const user = new User();
      user.id = randomUUID();
      user.username = command.username;
      user.email = command.email;
      user.passwordHash = this.passwordHasher.hashPassword(command.password);
      user.role = command.role || UserRole.Default;
      user.isActive = true;
      user.createdAt = new Date();

      const createdUser = await this.userRepository.create(user);
      return this.mapToUserDto(createdUser);
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (error instanceof ConflictException) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao criar usuário. Por favor, tente novamente.',
        error
      );
    }
  }

  private mapToUserDto(user: User): UserDto {
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

