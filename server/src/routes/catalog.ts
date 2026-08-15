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
    where.name = { contains: String(search) };
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

router.get('/:assetId', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { assetId: req.params.assetId } });
  if (!item || !item.listed) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  res.json(item);
});

export default router;
