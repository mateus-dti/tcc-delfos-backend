import { Request, Response } from 'express';
import { CreateUserRequest } from '../../application/dto/requests/CreateUserRequest';
import { UpdateUserRequest } from '../../application/dto/requests/UpdateUserRequest';
import { CreateUserCommand } from '../../application/commands/users/CreateUserCommand';
import { CreateUserCommandHandler } from '../../application/commands/users/CreateUserCommandHandler';
import { UpdateUserCommand } from '../../application/commands/users/UpdateUserCommand';
import { UpdateUserCommandHandler } from '../../application/commands/users/UpdateUserCommandHandler';
import { DeleteUserCommand } from '../../application/commands/users/DeleteUserCommand';
import { DeleteUserCommandHandler } from '../../application/commands/users/DeleteUserCommandHandler';
import { GetAllUsersQuery } from '../../application/queries/users/GetAllUsersQuery';
import { GetAllUsersQueryHandler } from '../../application/queries/users/GetAllUsersQueryHandler';
import { GetUserByIdQuery } from '../../application/queries/users/GetUserByIdQuery';
import { GetUserByIdQueryHandler } from '../../application/queries/users/GetUserByIdQueryHandler';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class UsersController {
  constructor(
    private getAllUsersHandler: GetAllUsersQueryHandler,
    private getUserByIdHandler: GetUserByIdQueryHandler,
    private createUserHandler: CreateUserCommandHandler,
    private updateUserHandler: UpdateUserCommandHandler,
    private deleteUserHandler: DeleteUserCommandHandler
  ) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const query = new GetAllUsersQuery();
      const result = await this.getAllUsersHandler.handle(query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const query: GetUserByIdQuery = { id };
      const result = await this.getUserByIdHandler.handle(query);

      if (!result) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const createUserRequest = plainToInstance(CreateUserRequest, req.body);
      const errors = await validate(createUserRequest);

      if (errors.length > 0) {
        res.status(400).json({
          message: 'Validation failed',
          errors: errors.map((e) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
        return;
      }

      const command: CreateUserCommand = {
        username: createUserRequest.username,
        email: createUserRequest.email,
        password: createUserRequest.password,
      };

      const result = await this.createUserHandler.handle(command);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateUserRequest = plainToInstance(UpdateUserRequest, req.body);
      const errors = await validate(updateUserRequest, { skipMissingProperties: true });

      if (errors.length > 0) {
        res.status(400).json({
          message: 'Validation failed',
          errors: errors.map((e) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
        return;
      }

      const command: UpdateUserCommand = {
        id,
        email: updateUserRequest.email,
        password: updateUserRequest.password,
        isActive: updateUserRequest.isActive,
      };

      const result = await this.updateUserHandler.handle(command);
      res.json(result);
    } catch (error: any) {
      if (error.message && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const command: DeleteUserCommand = { id };
      const result = await this.deleteUserHandler.handle(command);

      if (!result) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

