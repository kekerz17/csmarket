import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const { search, minPrice, maxPrice, category } = req.query;

  const where: Record<string, any> = {
    listed: true,
    status: 'AVAILABLE',
    priceUsd: { not: null },
  };

  if (search) {
    where.name = { contains: String(search), mode: 'insensitive' };
  }
  if (category) {
    where.category = String(category);
  }
  if (minPrice || maxPrice) {
    where.priceUsd = {
      ...where.priceUsd,
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }

  const items = await prisma.item.findMany({ where, orderBy: { priceUsd: 'asc' } });
  res.json(items);
});

// Список категорий со счётчиками для сайдбара витрины (в стиле lis-skins).
// Должен быть объявлен раньше "/:assetId", иначе Express примет "categories"
// за id предмета.
router.get('/meta/categories', async (_req, res) => {
  const rows = await prisma.item.groupBy({
    by: ['category'],
    where: { listed: true, status: 'AVAILABLE', priceUsd: { not: null }, category: { not: null } },
    _count: { category: true },
  });

  const categories = rows
    .map((r) => ({ category: r.category as string, count: r._count.category }))
    .sort((a, b) => b.count - a.count);

  res.json(categories);
});

// Лента последних сделок для витрины (в стиле lis-skins/CS.MONEY) — только
// реально завершённые заказы, без выдуманных чисел. Должен быть объявлен
// раньше "/:assetId" по той же причине, что и "/meta/categories" выше.
router.get('/meta/recent-sales', async (_req, res) => {
  const [sales, total] = await Promise.all([
    prisma.order.findMany({
      where: { status: 'COMPLETED' },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
  ]);

  res.json({
    total,
    sales: sales.map((o) => ({
      id: o.id,
      priceUsd: o.priceUsd,
      name: o.item.name,
      iconUrl: o.item.iconUrl,
      exterior: o.item.exterior,
      rarityColor: o.item.rarityColor,
    })),
  });
});

router.get('/:assetId', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { assetId: req.params.assetId } });
  if (!item || !item.listed) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  res.json(item);
});

// Похожие предметы — сначала та же категория, затем ближе по цене. Инвентарь
// у нас небольшой (личная коллекция, не биржа), поэтому сортируем в памяти,
// а не через хитрый SQL — так проще и для такого объёма данных быстрее, чем
// того стоит отдельный индекс/raw-запрос.
router.get('/:assetId/similar', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { assetId: req.params.assetId } });
  if (!item) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }

  const candidates = await prisma.item.findMany({
    where: { listed: true, status: 'AVAILABLE', priceUsd: { not: null }, id: { not: item.id } },
  });

  const basePrice = item.priceUsd ?? 0;
  const similar = candidates
    .map((c) => {
      const categoryPenalty = c.category && c.category === item.category ? 0 : 100;
      const priceDiff = Math.abs((c.priceUsd ?? 0) - basePrice) / Math.max(basePrice, 1);
      return { item: c, score: categoryPenalty + priceDiff };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 6)
    .map((s) => s.item);

  res.json(similar);
});

export default router;
