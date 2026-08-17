import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export function userAuth(req: Request, res: Response, next: NextFunction) {
  // Некоторые браузеры (Safari ITP, Firefox ETP, и постепенно Chrome) по
  // умолчанию блокируют "третьесторонние" cookie (SameSite=None) именно в
  // сценарии фронтенд/бэкенд на разных доменах — сама cookie при этом
  // исправно ставится сервером, но браузер её не отправляет обратно. Поэтому
  // помимо cookie принимаем токен и через Authorization-заголовок — фронтенд
  // после Steam-логина дублирует токен в localStorage и шлёт его так же,
  // как более надёжный запасной канал.
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = bearerToken ?? req.cookies?.user_token;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(token, env.user.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
