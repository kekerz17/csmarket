import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { userAuth } from '../middleware/userAuth.js';
import { sendItem } from '../services/tradeBot.js';
import { notifyAdmin } from '../services/telegram.js';

const router = Router();

router.use(userAuth);

const purchaseSchema = z.object({ assetId: z.string().min(1) });

router.post('/', async (req, res) => {
  const parsed = purchaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const buyer = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!buyer) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!buyer.tradeUrl) {
    res.status(400).json({ error: 'NO_TRADE_URL', message: 'Укажите Steam trade URL в профиле перед покупкой' });
    return;
  }

  const result = await prisma
    .$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { assetId: parsed.data.assetId } });
      if (!item || !item.listed || item.status !== 'AVAILABLE' || item.priceUsd == null) {
        throw new Error('ITEM_UNAVAILABLE');
      }
      if (buyer.balanceUsd < item.priceUsd) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      await tx.item.update({ where: { id: item.id }, data: { status: 'RESERVED' } });
      await tx.user.update({ where: { id: buyer.id }, data: { balanceUsd: { decrement: item.priceUsd } } });

      const order = await tx.order.create({
        data: { itemId: item.id, userId: buyer.id, priceUsd: item.priceUsd, status: 'PAID' },
      });
      return { order, itemName: item.name };
    })
    .catch((err) => {
      if (err.message === 'ITEM_UNAVAILABLE' || err.message === 'INSUFFICIENT_BALANCE') return err.message;
      throw err;
    });

  if (result === 'ITEM_UNAVAILABLE') {
    res.status(409).json({ error: 'Предмет уже недоступен для покупки' });
    return;
  }
  if (result === 'INSUFFICIENT_BALANCE') {
    res.status(402).json({ error: 'INSUFFICIENT_BALANCE', message: 'Недостаточно средств на балансе' });
    return;
  }

  const { order, itemName } = result;

  sendItem(order.id).catch((err) => console.error('[purchases] Ошибка отправки трейда', err));

  notifyAdmin(
    `🛒 Новый заказ #${order.id.slice(0, 8)}\n` +
      `${itemName} — $${order.priceUsd.toFixed(2)}\n` +
      `Покупатель: ${buyer.personaName} (steamid ${buyer.steamId64})`,
  ).catch(() => {});

  res.status(201).json({ orderId: order.id });
});

export default router;
