import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userName?: string;
  isAdmin?: boolean;
}

interface JwtPayload {
  userId: string;
  name: string;
  isAdmin: boolean;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token de autenticação não fornecido' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET ?? 'urban-data-hub-secret';

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.userId;
    req.userName = payload.name;
    req.isAdmin = payload.isAdmin ?? false;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.isAdmin) {
      res.status(403).json({ message: 'Acesso restrito a administradores' });
      return;
    }
    next();
  });
}
