import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { UserRole } from '../../domain/enums/UserRole';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';

/**
 * Middleware para verificar se o usuário tem uma das roles permitidas
 * @param allowedRoles Array de roles permitidas
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      const exception = new UnauthorizedException(
        'Usuário não autenticado. Por favor, faça login novamente.'
      );
      res.status(exception.statusCode).json(exception.toJSON());
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const roleNames = allowedRoles.map((r) => {
        const names: Record<UserRole, string> = {
          [UserRole.Admin]: 'Administrador',
          [UserRole.Manager]: 'Gerente',
          [UserRole.Default]: 'Usuário',
        };
        return names[r];
      }).join(' ou ');

      const exception = new ForbiddenException(
        `Acesso negado. Esta ação requer permissão de ${roleNames}. Sua role atual: ${user.role === UserRole.Admin ? 'Administrador' : user.role === UserRole.Manager ? 'Gerente' : 'Usuário'}.`
      );
      res.status(exception.statusCode).json(exception.toJSON());
      return;
    }

    next();
  };
}

/**
 * Middleware para verificar se o usuário é admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRole([UserRole.Admin])(req, res, next);
}

/**
 * Middleware para verificar se o usuário é admin ou manager
 */
export function requireManagerOrAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRole([UserRole.Manager, UserRole.Admin])(req, res, next);
}

