import { UpdateUserCommand, IUpdateUserCommandHandler } from './UpdateUserCommand';
import { UserDto } from '../../dto/responses/UserDto';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IPasswordHasherService } from '../../domain/interfaces/IPasswordHasherService';

export class UpdateUserCommandHandler implements IUpdateUserCommandHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasherService
  ) {}

  async handle(command: UpdateUserCommand): Promise<UserDto> {
    const user = await this.userRepository.getById(command.id);

    if (!user) {
      throw new Error(`User with ID ${command.id} not found`);
    }

    // Update email if provided
    if (command.email && command.email.trim().length > 0) {
      if (await this.userRepository.existsByEmail(command.email) && user.email !== command.email) {
        throw new Error(`Email '${command.email}' already exists`);
      }
      user.email = command.email;
    }

    // Update password if provided
    if (command.password && command.password.trim().length > 0) {
      user.passwordHash = this.passwordHasher.hashPassword(command.password);
    }

    // Update IsActive if provided
    if (command.isActive !== undefined) {
      user.isActive = command.isActive;
    }

    const updatedUser = await this.userRepository.update(user);
    return this.mapToUserDto(updatedUser);
  }

  private mapToUserDto(user: any): UserDto {
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

