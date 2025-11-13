import { UserDto } from '../../dto/responses/UserDto';

export class GetCurrentUserQuery {
  userId!: string;
}

export interface IGetCurrentUserQueryHandler {
  handle(query: GetCurrentUserQuery): Promise<UserDto | null>;
}

