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

export interface SellSettings {
  // Популярные маркетплейсы платят за моментальный выкуп 60-95% от рыночной
  // цены (DMarket ~60-80%, топовые вроде Aim.market — до 95%); берём 70% по
  // умолчанию — с запасом в пользу владельца сайта, настраивается в админке.
  buybackPercent: number;
  // Предметы дешевле этой суммы не принимаем — ручная сделка (написать
  // трейд, дождаться, проверить, зачислить) не окупает себя на копейках.
  minPriceUsd: number;
  // Trade URL аккаунта, на который продавцы отправляют предметы. Может
  // отличаться от STEAM_OWNER_ID64 (например, если удобнее принимать всё
  // на один конкретный аккаунт из нескольких, см. STEAM_OWNER_ID64_EXTRA).
  receivingTradeUrl: string;
}

const DEFAULT_SELL_SETTINGS: SellSettings = { buybackPercent: 70, minPriceUsd: 0.5, receivingTradeUrl: '' };

export async function getSellSettings(): Promise<SellSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ['sell_buyback_percent', 'sell_min_price_usd', 'sell_receiving_trade_url'] } },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  return {
    buybackPercent: Number(byKey.get('sell_buyback_percent') ?? DEFAULT_SELL_SETTINGS.buybackPercent),
    minPriceUsd: Number(byKey.get('sell_min_price_usd') ?? DEFAULT_SELL_SETTINGS.minPriceUsd),
    receivingTradeUrl: byKey.get('sell_receiving_trade_url') ?? DEFAULT_SELL_SETTINGS.receivingTradeUrl,
  };
}

export async function setSellSettings(settings: SellSettings): Promise<void> {
  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: 'sell_buyback_percent' },
      create: { key: 'sell_buyback_percent', value: String(settings.buybackPercent) },
      update: { value: String(settings.buybackPercent) },
    }),
    prisma.setting.upsert({
      where: { key: 'sell_min_price_usd' },
      create: { key: 'sell_min_price_usd', value: String(settings.minPriceUsd) },
      update: { value: String(settings.minPriceUsd) },
    }),
    prisma.setting.upsert({
      where: { key: 'sell_receiving_trade_url' },
      create: { key: 'sell_receiving_trade_url', value: settings.receivingTradeUrl },
      update: { value: settings.receivingTradeUrl },
    }),
  ]);
}

// Реферальная программа: процент, который приглашающий получает от суммы,
// выплаченной приглашённому пользователю за проданный сайту скин (см.
// admin.ts — начисление происходит в момент подтверждения SellOrder).
const DEFAULT_REFERRAL_PERCENT = 2;

export async function getReferralPercent(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: 'referral_percent' } });
  return row ? Number(row.value) : DEFAULT_REFERRAL_PERCENT;
}

export async function setReferralPercent(percent: number): Promise<void> {
  await prisma.setting.upsert({
    where: { key: 'referral_percent' },
    create: { key: 'referral_percent', value: String(percent) },
    update: { value: String(percent) },
  });
}
