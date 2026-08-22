import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { authCookieOptions } from '../lib/cookies.js';
import { getBestMarketPrice } from '../services/pricing.js';
import { warmSkinportCache, getSkinportPrice } from '../services/skinportPricing.js';
import { getBotStatus, getFloat } from '../services/tradeBot.js';
import { getExchangeRates, setExchangeRates, getSellSettings, setSellSettings } from '../lib/settings.js';

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
  res.cookie('admin_token', token, authCookieOptions(12 * 60 * 60 * 1000));
  res.json({ ok: true });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('admin_token', authCookieOptions(0));
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

  const price = await getBestMarketPrice(item.marketHashName);
  if (price == null) {
    res.status(502).json({ error: 'Не удалось получить цену ни с одного источника (Skinport, Steam Market)' });
    return;
  }

  const updated = await prisma.item.update({ where: { id: item.id }, data: { suggestedMarketPrice: price } });
  res.json(updated);
});

// Массовое обновление рыночных цен по всем выставленным предметам сразу —
// использует уже прогретый кэш Skinport, поэтому не упирается в лимиты
// Steam и отрабатывает за секунды даже на большом инвентаре.
router.post('/items/refresh-all-prices', async (_req, res) => {
  await warmSkinportCache();

  const items = await prisma.item.findMany({ where: { status: 'AVAILABLE' } });
  let updated = 0;
  for (const item of items) {
    const price = await getSkinportPrice(item.marketHashName);
    if (price != null) {
      await prisma.item.update({ where: { id: item.id }, data: { suggestedMarketPrice: price } });
      updated++;
    }
  }

  res.json({ total: items.length, updated });
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

const ACTIVE_ORDER_STATUSES = ['AWAITING_MANUAL_FULFILLMENT', 'TRADE_SENT'];

router.post('/orders/:id/fulfill', async (req, res) => {
  const parsed = z.object({ action: z.enum(['sent', 'completed', 'failed']) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  if (!ACTIVE_ORDER_STATUSES.includes(order.status)) {
    res.status(409).json({ error: `Заказ уже в статусе ${order.status} — действие недоступно` });
    return;
  }

  if (parsed.data.action === 'sent') {
    const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'TRADE_SENT' } });
    res.json(updated);
    return;
  }

  if (parsed.data.action === 'completed') {
    const [updated] = await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } }),
      prisma.item.update({ where: { id: order.itemId }, data: { status: 'SOLD' } }),
    ]);
    res.json(updated);
    return;
  }

  // action === 'failed' — возвращаем деньги на баланс и предмет в продажу,
  // ровно так же, как при автоматическом провале трейда у бота.
  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: 'FAILED', failureReason: 'Отмечено продавцом вручную' },
    }),
    prisma.item.update({ where: { id: order.itemId }, data: { status: 'AVAILABLE' } }),
    prisma.user.update({ where: { id: order.userId }, data: { balanceUsd: { increment: order.priceUsd } } }),
  ]);
  res.json(updated);
});

router.get('/bot-status', (_req, res) => {
  res.json(getBotStatus());
});

router.get('/settings/exchange-rates', async (_req, res) => {
  res.json(await getExchangeRates());
});

router.patch('/settings/exchange-rates', async (req, res) => {
  const parsed = z.object({ RUB: z.number().positive(), EUR: z.number().positive() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  await setExchangeRates(parsed.data);
  res.json(parsed.data);
});

router.get('/settings/sell', async (_req, res) => {
  res.json(await getSellSettings());
});

router.patch('/settings/sell', async (req, res) => {
  const parsed = z
    .object({
      buybackPercent: z.number().min(1).max(100),
      minPriceUsd: z.number().min(0),
      receivingTradeUrl: z.string(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  await setSellSettings(parsed.data);
  res.json(parsed.data);
});

router.get('/sell-orders', async (_req, res) => {
  const offers = await prisma.sellOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });
  res.json(offers);
});

const ACTIVE_SELL_STATUSES = ['PENDING_TRANSFER', 'AWAITING_CONFIRMATION'];

router.post('/sell-orders/:id/confirm', async (req, res) => {
  const parsed = z.object({ action: z.enum(['received', 'rejected']) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const offer = await prisma.sellOrder.findUnique({ where: { id: req.params.id } });
  if (!offer) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  if (!ACTIVE_SELL_STATUSES.includes(offer.status)) {
    res.status(409).json({ error: `Заявка уже в статусе ${offer.status} — действие недоступно` });
    return;
  }

  if (parsed.data.action === 'received') {
    // Деньги зачисляются только сейчас, после того как владелец сайта сам
    // убедился, что предмет реально дошёл (пережил trade hold и т.п.) —
    // намеренно не раньше, см. комментарий у модели SellOrder.
    const [updated] = await prisma.$transaction([
      prisma.sellOrder.update({ where: { id: offer.id }, data: { status: 'COMPLETED' } }),
      prisma.user.update({ where: { id: offer.userId }, data: { balanceUsd: { increment: offer.payoutUsd } } }),
    ]);
    res.json(updated);
    return;
  }

  const updated = await prisma.sellOrder.update({
    where: { id: offer.id },
    data: { status: 'REJECTED', adminNote: 'Отклонено владельцем' },
  });
  res.json(updated);
});

export default router;
