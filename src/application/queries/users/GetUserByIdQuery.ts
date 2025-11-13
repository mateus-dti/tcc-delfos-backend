import { UserDto } from '../../dto/responses/UserDto';

export class GetUserByIdQuery {
  id!: string;
}

export interface IGetUserByIdQueryHandler {
  handle(query: GetUserByIdQuery): Promise<UserDto | null>;
}

