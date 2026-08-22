import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { userAuth } from '../middleware/userAuth.js';
import { getSellSettings } from '../lib/settings.js';
import { getBestMarketPrice } from '../services/pricing.js';
import { fetchFullInventory, getExterior, getCategory } from '../services/steamInventory.js';
import { notifyAdmin } from '../services/telegram.js';

const router = Router();

router.use(userAuth);

const sellableCache = new Map<string, { expiresAt: number; items: SellableItem[] }>();
const CACHE_TTL_MS = 60_000;

interface SellableItem {
  assetId: string;
  marketHashName: string;
  name: string;
  iconUrl: string;
  exterior: string | null;
  category: string | null;
  marketPriceUsd: number | null;
  payoutUsd: number | null;
  sellable: boolean;
}

router.get('/inventory', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const cached = sellableCache.get(user.steamId64);
  if (cached && cached.expiresAt > Date.now()) {
    res.json(cached.items);
    return;
  }

  const inventory = await fetchFullInventory(user.steamId64);
  if (!inventory) {
    res.status(502).json({
      error: 'INVENTORY_UNAVAILABLE',
      message: 'Не удалось получить ваш инвентарь Steam. Убедитесь, что инвентарь публичный, и попробуйте ещё раз.',
    });
    return;
  }

  const settings = await getSellSettings();
  const { assets, descByKey } = inventory;

  const items: SellableItem[] = [];
  for (const asset of assets) {
    const desc = descByKey.get(`${asset.classid}_${asset.instanceid}`);
    if (!desc || !desc.tradable || !desc.marketable) continue;

    const marketPriceUsd = await getBestMarketPrice(desc.market_hash_name);
    const payoutUsd = marketPriceUsd != null ? Math.round(marketPriceUsd * (settings.buybackPercent / 100) * 100) / 100 : null;
    const sellable = payoutUsd != null && marketPriceUsd! >= settings.minPriceUsd;

    items.push({
      assetId: asset.assetid,
      marketHashName: desc.market_hash_name,
      name: desc.name,
      iconUrl: `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}`,
      exterior: getExterior(desc) ?? null,
      category: getCategory(desc) ?? null,
      marketPriceUsd,
      payoutUsd,
      sellable,
    });
  }

  sellableCache.set(user.steamId64, { expiresAt: Date.now() + CACHE_TTL_MS, items });
  res.json(items);
});

const createOfferSchema = z.object({
  assetId: z.string().min(1),
  marketHashName: z.string().min(1),
  name: z.string().min(1),
  iconUrl: z.string().min(1),
  exterior: z.string().nullable().optional(),
});

router.post('/offers', async (req, res) => {
  const parsed = createOfferSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  // Сумму выкупа никогда не берём из тела запроса от клиента — только
  // свежий пересчёт по актуальной рыночной цене на сервере.
  const settings = await getSellSettings();
  const marketPriceUsd = await getBestMarketPrice(parsed.data.marketHashName);
  if (marketPriceUsd == null || marketPriceUsd < settings.minPriceUsd) {
    res.status(400).json({ error: 'ITEM_NOT_SELLABLE', message: 'Этот предмет сейчас нельзя продать (не удалось определить цену или она слишком мала)' });
    return;
  }
  if (!settings.receivingTradeUrl) {
    res.status(503).json({ error: 'SELL_NOT_CONFIGURED', message: 'Продажа скинов временно недоступна — попробуйте позже' });
    return;
  }

  const payoutUsd = Math.round(marketPriceUsd * (settings.buybackPercent / 100) * 100) / 100;

  const offer = await prisma.sellOrder.create({
    data: {
      userId: req.userId!,
      assetId: parsed.data.assetId,
      marketHashName: parsed.data.marketHashName,
      name: parsed.data.name,
      iconUrl: parsed.data.iconUrl,
      exterior: parsed.data.exterior ?? null,
      marketPriceUsd,
      payoutUsd,
      status: 'PENDING_TRANSFER',
    },
  });

  notifyAdmin(
    `📥 Новая заявка на выкуп #${offer.id.slice(0, 8)}\n${offer.name} — выплата $${offer.payoutUsd.toFixed(2)} (рынок $${offer.marketPriceUsd.toFixed(2)})\nОжидаем трейд на ${settings.receivingTradeUrl}`,
  ).catch(() => {});

  res.status(201).json({ ...offer, receivingTradeUrl: settings.receivingTradeUrl });
});

router.post('/offers/:id/mark-sent', async (req, res) => {
  const offer = await prisma.sellOrder.findUnique({ where: { id: req.params.id } });
  if (!offer || offer.userId !== req.userId) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  if (offer.status !== 'PENDING_TRANSFER') {
    res.status(409).json({ error: 'Заявка уже не в статусе ожидания отправки' });
    return;
  }

  const updated = await prisma.sellOrder.update({
    where: { id: offer.id },
    data: { status: 'AWAITING_CONFIRMATION' },
  });

  notifyAdmin(
    `📦 Продавец отметил, что отправил трейд по заявке #${offer.id.slice(0, 8)} (${offer.name}) — проверьте Steam и подтвердите получение в админке.`,
  ).catch(() => {});

  res.json(updated);
});

router.get('/offers', async (req, res) => {
  const offers = await prisma.sellOrder.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(offers);
});

export default router;
