import { randomUUID } from 'crypto';
import { CreateUserCommand, ICreateUserCommandHandler } from './CreateUserCommand';
import { UserDto } from '../../dto/responses/UserDto';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IPasswordHasherService } from '../../domain/interfaces/IPasswordHasherService';

export class CreateUserCommandHandler implements ICreateUserCommandHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasherService
  ) {}

  async handle(command: CreateUserCommand): Promise<UserDto> {
    // Check if username already exists
    if (await this.userRepository.existsByUsername(command.username)) {
      throw new Error(`Username '${command.username}' already exists`);
    }

    // Check if email already exists
    if (await this.userRepository.existsByEmail(command.email)) {
      throw new Error(`Email '${command.email}' already exists`);
    }

    const user = new User();
    user.id = randomUUID();
    user.username = command.username;
    user.email = command.email;
    user.passwordHash = this.passwordHasher.hashPassword(command.password);
    user.isActive = true;
    user.createdAt = new Date();

    const createdUser = await this.userRepository.create(user);
    return this.mapToUserDto(createdUser);
  }

  private mapToUserDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}

