import { GetUserByIdQuery, IGetUserByIdQueryHandler } from './GetUserByIdQuery';
import { UserDto } from '../../dto/responses/UserDto';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';

export class GetUserByIdQueryHandler implements IGetUserByIdQueryHandler {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetUserByIdQuery): Promise<UserDto | null> {
    const user = await this.userRepository.getById(query.id);
    if (!user) {
      return null;
    }
    return this.mapToUserDto(user);
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

