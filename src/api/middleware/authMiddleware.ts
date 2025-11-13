import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/enums/UserRole';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const exception = new UnauthorizedException(
        'Token de autenticação não fornecido. Por favor, faça login novamente.'
      );
      res.status(exception.statusCode).json(exception.toJSON());
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Erro de configuração do servidor. Entre em contato com o administrador.',
        },
      });
      return;
    }

    const decoded = jwt.verify(token, secret, {
      issuer: process.env.JWT_ISSUER || 'Delfos',
      audience: process.env.JWT_AUDIENCE || 'Delfos',
    }) as any;

    (req as AuthRequest).user = {
      sub: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role || 'default',
    };

    next();
  } catch (error: any) {
    let message = 'Token de autenticação inválido ou expirado. Por favor, faça login novamente.';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Seu token de autenticação expirou. Por favor, faça login novamente.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token de autenticação inválido. Por favor, faça login novamente.';
    }

    const exception = new UnauthorizedException(message);
    res.status(exception.statusCode).json(exception.toJSON());
  }
}

