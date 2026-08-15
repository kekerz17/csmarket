import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_token;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    jwt.verify(token, env.admin.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
