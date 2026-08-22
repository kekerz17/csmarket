import { getSkinportPrice } from './skinportPricing.js';

// Skinport — основной источник: отдаёт цены на весь каталог одним запросом и
// не подвержен блокировкам Steam по IP дата-центра. Steam Market — запасной
// вариант для редких предметов, которых нет на Skinport. Используется и для
// подсказки цены в админке, и для расчёта суммы выкупа скинов у пользователей.
export async function getBestMarketPrice(marketHashName: string): Promise<number | null> {
  const skinportPrice = await getSkinportPrice(marketHashName);
  if (skinportPrice != null) return skinportPrice;
  return getMarketPrice(marketHashName);
}

// Steam Market priceoverview жёстко ограничивает частоту запросов —
// держим минимум ~1.2с между вызовами, чтобы не словить временный бан по IP.
let lastCallAt = 0;
const MIN_INTERVAL_MS = 1200;

async function throttle() {
  const wait = lastCallAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastCallAt = Date.now();
}

export async function getMarketPrice(marketHashName: string): Promise<number | null> {
  await throttle();
  try {
    const params = new URLSearchParams({ appid: '730', currency: '1', market_hash_name: marketHashName });
    const res = await fetch(`https://steamcommunity.com/market/priceoverview/?${params}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://steamcommunity.com/market/',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`[pricing] Steam Market вернул статус ${res.status}`);
      return null;
    }

    const data = await res.json();
    const raw = data.lowest_price ?? data.median_price;
    if (!raw) return null;

    const num = Number(String(raw).replace(/[^0-9.,]/g, '').replace(',', '.'));
    return Number.isFinite(num) ? num : null;
  } catch (err: any) {
    console.error('[pricing] Не удалось получить цену со Steam Market', err.message ?? err);
    return null;
  }
}
