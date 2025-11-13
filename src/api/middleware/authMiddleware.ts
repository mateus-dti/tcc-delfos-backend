import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    name: string;
    email: string;
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized - No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({ message: 'JWT configuration error' });
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
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
}

