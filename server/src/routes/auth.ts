import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { userAuth } from '../middleware/userAuth.js';
import { steamTradeUrlSchema } from '../lib/validators.js';
import { authCookieOptions } from '../lib/cookies.js';
import passport from '../services/passport.js';

const router = Router();

const USER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 дней

function issueSession(res: import('express').Response, userId: string): string {
  const token = jwt.sign({ sub: userId }, env.user.jwtSecret, { expiresIn: '30d' });
  res.cookie('user_token', token, authCookieOptions(USER_COOKIE_MAX_AGE));
  return token;
}

if (env.steam.apiKey) {
  router.get('/steam', passport.authenticate('steam'));

  router.get(
    '/steam/return',
    passport.authenticate('steam', { session: false, failureRedirect: env.clientUrl }),
    async (req, res) => {
      const profile: any = req.user;
      const steamId64 = profile.id;
      const personaName = profile.displayName ?? 'Steam User';
      const avatarUrl = profile._json?.avatarfull ?? profile.photos?.[2]?.value ?? '';

      const user = await prisma.user.upsert({
        where: { steamId64 },
        create: { steamId64, personaName, avatarUrl },
        update: { personaName, avatarUrl },
      });

      const token = issueSession(res, user.id);
      // Токен дублируем во фрагменте URL (после #) — он не уходит на сервер
      // и не попадает в логи/Referer, но фронтенд может забрать его на
      // клиенте и сохранить в localStorage. Это запасной канал на случай,
      // если браузер блокирует саму cross-site cookie (см. userAuth.ts).
      res.redirect(`${env.clientUrl}/profile#token=${token}`);
    },
  );
} else {
  console.warn('[auth] STEAM_API_KEY не задан — настоящий Steam-логин отключён, доступен только /api/auth/dev-login');

  router.post('/dev-login', async (req, res) => {
    const parsed = z.object({ personaName: z.string().min(1).max(40) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const fakeSteamId64 = `dev_${crypto.createHash('md5').update(parsed.data.personaName).digest('hex').slice(0, 16)}`;
    const user = await prisma.user.upsert({
      where: { steamId64: fakeSteamId64 },
      create: {
        steamId64: fakeSteamId64,
        personaName: parsed.data.personaName,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(parsed.data.personaName)}`,
      },
      update: {},
    });

    issueSession(res, user.id);
    res.json({ ok: true });
  });
}

router.post('/logout', (_req, res) => {
  res.clearCookie('user_token', authCookieOptions(0));
  res.json({ ok: true });
});

router.get('/me', userAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  res.json(user);
});

router.patch('/me/trade-url', userAuth, async (req, res) => {
  const parsed = z.object({ tradeUrl: steamTradeUrlSchema }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { tradeUrl: parsed.data.tradeUrl },
  });
  res.json(user);
});

router.get('/me/orders', userAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { item: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

export default router;
