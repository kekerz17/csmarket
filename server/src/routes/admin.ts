import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { getMarketPrice } from '../services/pricing.js';
import { getBotStatus, getFloat } from '../services/tradeBot.js';

const router = Router();

router.post('/login', async (req, res) => {
  const parsed = z.object({ password: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  if (!env.admin.passwordHash) {
    res.status(500).json({ error: 'ADMIN_PASSWORD_HASH не задан в .env — см. README' });
    return;
  }

  const ok = await bcrypt.compare(parsed.data.password, env.admin.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Неверный пароль' });
    return;
  }

  const token = jwt.sign({ role: 'admin' }, env.admin.jwtSecret, { expiresIn: '12h' });
  res.cookie('admin_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 12 * 60 * 60 * 1000 });
  res.json({ ok: true });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('admin_token');
  res.json({ ok: true });
});

router.use(adminAuth);

router.get('/items', async (_req, res) => {
  const items = await prisma.item.findMany({ orderBy: { lastSeenAt: 'desc' } });
  res.json(items);
});

router.patch('/items/:id', async (req, res) => {
  const parsed = z
    .object({ priceUsd: z.number().positive().nullable().optional(), listed: z.boolean().optional() })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const item = await prisma.item.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(item);
});

router.post('/items/:id/suggest-price', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } });
  if (!item) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }

  const price = await getMarketPrice(item.marketHashName);
  if (price == null) {
    res.status(502).json({ error: 'Steam Market не вернул цену' });
    return;
  }

  const updated = await prisma.item.update({ where: { id: item.id }, data: { suggestedMarketPrice: price } });
  res.json(updated);
});

router.post('/items/:id/refresh-float', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } });
  if (!item) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  if (!item.exterior) {
    res.status(400).json({ error: 'У этого предмета нет износа/float (не оружейный скин)' });
    return;
  }

  const float = await getFloat({ assetId: item.assetId, exterior: item.exterior });
  if (float.value == null) {
    res.status(502).json({ error: 'Не удалось получить float (Game Coordinator не ответил)' });
    return;
  }

  const updated = await prisma.item.update({
    where: { id: item.id },
    data: { floatValue: float.value, floatSource: float.source },
  });
  res.json(updated);
});

router.get('/orders', async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { item: true, user: true },
  });
  res.json(orders);
});

router.get('/bot-status', (_req, res) => {
  res.json(getBotStatus());
});

export default router;
