import { prisma } from '../db.js';

// Курсы обновлены вручную на 17.08.2026 (1 USD = X RUB/EUR). Меняются
// через админку (PATCH /api/admin/settings/exchange-rates) без редеплоя —
// эти значения только "запасной вариант", если в БД ещё ничего не задано.
const DEFAULT_RATES = { RUB: 84.25, EUR: 0.87 };

export async function getExchangeRates(): Promise<{ RUB: number; EUR: number }> {
  const rows = await prisma.setting.findMany({ where: { key: { in: ['rate_rub', 'rate_eur'] } } });
  const byKey = new Map(rows.map((r) => [r.key, Number(r.value)]));

  return {
    RUB: byKey.get('rate_rub') ?? DEFAULT_RATES.RUB,
    EUR: byKey.get('rate_eur') ?? DEFAULT_RATES.EUR,
  };
}

export async function setExchangeRates(rates: { RUB: number; EUR: number }): Promise<void> {
  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: 'rate_rub' },
      create: { key: 'rate_rub', value: String(rates.RUB) },
      update: { value: String(rates.RUB) },
    }),
    prisma.setting.upsert({
      where: { key: 'rate_eur' },
      create: { key: 'rate_eur', value: String(rates.EUR) },
      update: { value: String(rates.EUR) },
    }),
  ]);
}
