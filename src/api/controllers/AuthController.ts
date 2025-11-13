import { Request, Response, NextFunction } from 'express';
import { LoginRequest } from '../../application/dto/requests/LoginRequest';
import { LoginCommand } from '../../application/commands/auth/LoginCommand';
import { LoginCommandHandler } from '../../application/commands/auth/LoginCommandHandler';
import { GetCurrentUserQuery } from '../../application/queries/auth/GetCurrentUserQuery';
import { GetCurrentUserQueryHandler } from '../../application/queries/auth/GetCurrentUserQueryHandler';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationException } from '../../domain/exceptions/ValidationException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';

export class AuthController {
  constructor(
    private loginHandler: LoginCommandHandler,
    private getCurrentUserHandler: GetCurrentUserQueryHandler
  ) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginRequest = plainToInstance(LoginRequest, req.body);
      const errors = await validate(loginRequest);

      if (errors.length > 0) {
        const validationErrors = errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        }));
        throw new ValidationException(
          'Os dados de login são inválidos. Por favor, verifique o nome de usuário e senha.',
          validationErrors
        );
      }

      const command: LoginCommand = {
        username: loginRequest.username,
        password: loginRequest.password,
      };

      const result = await this.loginHandler.handle(command);

      if (!result) {
        throw new UnauthorizedException(
          'Nome de usuário ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.'
        );
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        throw new UnauthorizedException('Você precisa estar autenticado para visualizar suas informações.');
      }

      const query: GetCurrentUserQuery = { userId };
      const result = await this.getCurrentUserHandler.handle(query);

      if (!result) {
        throw new NotFoundException('Usuário', userId);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // In a stateless JWT implementation, logout is handled client-side
    // by removing the token. For future implementation with refresh tokens,
    // we would invalidate the refresh token here.
    res.json({ message: 'Logged out successfully' });
  }
}

