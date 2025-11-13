import { Request, Response } from 'express';
import { LoginRequest } from '../../application/dto/requests/LoginRequest';
import { LoginCommand } from '../../application/commands/auth/LoginCommand';
import { LoginCommandHandler } from '../../application/commands/auth/LoginCommandHandler';
import { GetCurrentUserQuery } from '../../application/queries/auth/GetCurrentUserQuery';
import { GetCurrentUserQueryHandler } from '../../application/queries/auth/GetCurrentUserQueryHandler';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class AuthController {
  constructor(
    private loginHandler: LoginCommandHandler,
    private getCurrentUserHandler: GetCurrentUserQueryHandler
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginRequest = plainToInstance(LoginRequest, req.body);
      const errors = await validate(loginRequest);

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

      const command: LoginCommand = {
        username: loginRequest.username,
        password: loginRequest.password,
      };

      const result = await this.loginHandler.handle(command);

      if (!result) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const query: GetCurrentUserQuery = { userId };
      const result = await this.getCurrentUserHandler.handle(query);

      if (!result) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // In a stateless JWT implementation, logout is handled client-side
    // by removing the token. For future implementation with refresh tokens,
    // we would invalidate the refresh token here.
    res.json({ message: 'Logged out successfully' });
  }
}

