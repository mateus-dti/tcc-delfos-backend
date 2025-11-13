import { randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { LoginCommand, ILoginCommandHandler } from './LoginCommand';
import { LoginResponse } from '../../dto/responses/LoginResponse';
import { UserDto } from '../../dto/responses/UserDto';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { IPasswordHasherService } from '../../../domain/interfaces/IPasswordHasherService';
import { Logger } from 'winston';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';

export class LoginCommandHandler implements ILoginCommandHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasherService,
    private logger: Logger
  ) {}

  async handle(command: LoginCommand): Promise<LoginResponse | null> {
    const user = await this.userRepository.getByUsername(command.username);

    if (!user || !user.isActive) {
      this.logger.warn(`Login attempt failed: User not found or inactive - ${command.username}`);
      return null;
    }

    if (!this.passwordHasher.verifyPassword(command.password, user.passwordHash)) {
      this.logger.warn(`Login attempt failed: Invalid password - ${command.username}`);
      return null;
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.update(user);

    // Generate JWT token
    const token = this.generateJwtToken(user);
    const expirationMinutes = parseInt(process.env.JWT_EXPIRATION_MINUTES || '60');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    return {
      token,
      expiresAt,
      user: this.mapToUserDto(user),
    };
  }

  private generateJwtToken(user: any): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new DatabaseException(
        'Erro de configuração: JWT_SECRET não está configurado. Entre em contato com o administrador do sistema.'
      );
    }

    const issuer = process.env.JWT_ISSUER || 'Delfos';
    const audience = process.env.JWT_AUDIENCE || 'Delfos';
    const expirationMinutes = parseInt(process.env.JWT_EXPIRATION_MINUTES || '60');

    const payload = {
      sub: user.id,
      name: user.username,
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    };

    return jwt.sign(payload, secret, {
      issuer,
      audience,
      expiresIn: `${expirationMinutes}m`,
    });
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

