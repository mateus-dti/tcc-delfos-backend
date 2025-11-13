import { UserDto } from '../../dto/responses/UserDto';

export class GetAllUsersQuery {}

export interface IGetAllUsersQueryHandler {
  handle(query: GetAllUsersQuery): Promise<UserDto[]>;
}

