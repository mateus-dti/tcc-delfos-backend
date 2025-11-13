import { GetUserByIdQuery, IGetUserByIdQueryHandler } from './GetUserByIdQuery';
import { UserDto } from '../../dto/responses/UserDto';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class GetUserByIdQueryHandler implements IGetUserByIdQueryHandler {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetUserByIdQuery): Promise<UserDto | null> {
    try {
      const user = await this.userRepository.getById(query.id);
      if (!user) {
        return null;
      }
      return this.mapToUserDto(user);
    } catch (error) {
      throw new DatabaseException(
        'Erro ao buscar usuário. Por favor, tente novamente.',
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

