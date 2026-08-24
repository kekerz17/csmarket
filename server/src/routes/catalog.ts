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

// Внутри категорий оружия ("Rifle", "Pistol"...) отдаём ещё и список
// конкретных моделей ("AK-47", "M4A4"...) — чтобы панель категорий в шапке
// могла показать выпадающий список и вести сразу на конкретное оружие, а не
// только на широкую категорию целиком.
const WEAPON_CATEGORIES = ['Knife', 'Pistol', 'Rifle', 'Sniper Rifle', 'SMG', 'Shotgun', 'Machinegun', 'Gloves'];

// StatTrak™/Souvenir — это модификатор поверх того же оружия, а не отдельная
// модель: "StatTrak™ Tec-9" и "Souvenir Tec-9" должны попадать в ту же группу
// "Tec-9", иначе в выпадающем списке одно и то же оружие дублируется.
function normalizeWeaponName(rawName: string): { weaponName: string; isPlainVariant: boolean } {
  const isPlainVariant = !/^(StatTrak™|Souvenir)\b/.test(rawName);
  const weaponName = rawName.replace(/^(StatTrak™\s*|Souvenir\s*)/, '').trim();
  return { weaponName, isPlainVariant };
}

router.get('/meta/category-groups', async (_req, res) => {
  const items = await prisma.item.findMany({
    where: { listed: true, status: 'AVAILABLE', priceUsd: { not: null }, category: { in: WEAPON_CATEGORIES } },
    select: { category: true, name: true, iconUrl: true },
  });

  // category -> weaponName -> iconUrl (картинка одного из скинов этого оружия
  // как узнаваемая "иконка" для выпадающего списка — предпочитаем обычный
  // вариант без StatTrak/Souvenir, если он есть, как более "базовый").
  const groups: Record<string, Map<string, { iconUrl: string; isPlainVariant: boolean }>> = {};
  for (const item of items) {
    if (!item.category) continue;
    const rawFirst = item.name.split(' | ')[0]?.trim();
    if (!rawFirst) continue;
    const { weaponName, isPlainVariant } = normalizeWeaponName(rawFirst);
    if (!weaponName) continue;

    const map = (groups[item.category] ??= new Map());
    const existing = map.get(weaponName);
    if (!existing || (isPlainVariant && !existing.isPlainVariant)) {
      map.set(weaponName, { iconUrl: item.iconUrl, isPlainVariant });
    }
  }

  const result: Record<string, { name: string; iconUrl: string }[]> = {};
  for (const [cat, map] of Object.entries(groups)) {
    result[cat] = Array.from(map.entries())
      .map(([name, { iconUrl }]) => ({ name, iconUrl }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  res.json(result);
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
