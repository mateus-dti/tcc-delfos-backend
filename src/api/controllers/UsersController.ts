import { Request, Response, NextFunction } from 'express';
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
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../../domain/enums/UserRole';
import { ValidationException } from '../../domain/exceptions/ValidationException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export class UsersController {
  constructor(
    private getAllUsersHandler: GetAllUsersQueryHandler,
    private getUserByIdHandler: GetUserByIdQueryHandler,
    private createUserHandler: CreateUserCommandHandler,
    private updateUserHandler: UpdateUserCommandHandler,
    private deleteUserHandler: DeleteUserCommandHandler
  ) {}

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = new GetAllUsersQuery();
      const result = await this.getAllUsersHandler.handle(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const query: GetUserByIdQuery = { id };
      const result = await this.getUserByIdHandler.handle(query);

      if (!result) {
        throw new NotFoundException('Usuário', id);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const currentUser = authReq.user;

      const createUserRequest = plainToInstance(CreateUserRequest, req.body);
      const errors = await validate(createUserRequest);

      if (errors.length > 0) {
        const validationErrors = errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        }));
        throw new ValidationException(
          'Os dados fornecidos são inválidos. Por favor, verifique os campos e tente novamente.',
          validationErrors
        );
      }

      // Apenas admin pode definir role ao criar usuário
      if (createUserRequest.role && currentUser?.role !== UserRole.Admin) {
        throw new ForbiddenException(
          'Apenas administradores podem definir roles ao criar usuários. Usuários comuns são criados com role "default" automaticamente.'
        );
      }

      const command: CreateUserCommand = {
        username: createUserRequest.username,
        email: createUserRequest.email,
        password: createUserRequest.password,
        role: createUserRequest.role,
      };

      const result = await this.createUserHandler.handle(command);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        throw new UnauthorizedException('Você precisa estar autenticado para atualizar um usuário.');
      }

      const updateUserRequest = plainToInstance(UpdateUserRequest, req.body);
      const errors = await validate(updateUserRequest, { skipMissingProperties: true });

      if (errors.length > 0) {
        const validationErrors = errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        }));
        throw new ValidationException(
          'Os dados fornecidos são inválidos. Por favor, verifique os campos e tente novamente.',
          validationErrors
        );
      }

      // Apenas admin pode alterar role e isActive
      if ((updateUserRequest.role !== undefined || updateUserRequest.isActive !== undefined) && 
          currentUser.role !== UserRole.Admin) {
        throw new ForbiddenException(
          'Apenas administradores podem alterar roles e status de ativação de usuários. Você pode atualizar apenas seu próprio email e senha.'
        );
      }

      const command: UpdateUserCommand = {
        id,
        email: updateUserRequest.email,
        password: updateUserRequest.password,
        role: updateUserRequest.role,
        isActive: updateUserRequest.isActive,
      };

      const result = await this.updateUserHandler.handle(command);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const command: DeleteUserCommand = { id };
      const result = await this.deleteUserHandler.handle(command);

      if (!result) {
        throw new NotFoundException('Usuário', id);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

