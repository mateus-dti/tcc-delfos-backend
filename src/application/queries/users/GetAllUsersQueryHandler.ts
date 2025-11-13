import { GetAllUsersQuery, IGetAllUsersQueryHandler } from './GetAllUsersQuery';
import { UserDto } from '../../dto/responses/UserDto';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';

export class GetAllUsersQueryHandler implements IGetAllUsersQueryHandler {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetAllUsersQuery): Promise<UserDto[]> {
    const users = await this.userRepository.getAll();
    return users.map((user) => this.mapToUserDto(user));
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

