// Резервный источник рыночных цен на случай, если Steam Market блокирует
// запросы по IP (частый случай для дата-центровых хостингов вроде Render,
// см. pricing.ts). Skinport отдаёт публичный каталог цен по всем предметам
// CS2 одним запросом, без ключа и без привязки к IP steamcommunity.com —
// это другой независимый сервис, поэтому блокировка Steam на него не влияет.
// Документация: https://docs.skinport.com/#tag/Items/operation/getItems

interface SkinportItem {
  market_hash_name: string;
  suggested_price: number | null;
  min_price: number | null;
  median_price?: number | null;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // час — каталог целиком, чаще обновлять незачем

let cache: Map<string, number> | null = null;
let cacheAt = 0;
let inFlight: Promise<Map<string, number>> | null = null;

async function loadCache(): Promise<Map<string, number>> {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch('https://api.skinport.com/v1/items?app_id=730&currency=USD', {
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`Skinport вернул статус ${res.status}`);
      const data = (await res.json()) as SkinportItem[];

      const map = new Map<string, number>();
      for (const it of data) {
        const price = it.suggested_price ?? it.min_price ?? it.median_price;
        if (price != null) map.set(it.market_hash_name, price);
      }

      cache = map;
      cacheAt = Date.now();
      console.log(`[skinport] Загружен каталог цен: ${map.size} предметов`);
      return map;
    } catch (err: any) {
      console.error('[skinport] Не удалось загрузить каталог цен:', err.message ?? err);
      // Старый кэш (если был) оставляем как есть — лучше немного устаревшие
      // цены, чем никакие. Если кэша не было вообще — отдаём пустой, чтобы
      // не пытаться грузить заново на каждый следующий вызов в эту же секунду.
      if (!cache) cache = new Map();
      return cache;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export async function getSkinportPrice(marketHashName: string): Promise<number | null> {
  const map = await loadCache();
  return map.get(marketHashName) ?? null;
}

// Прогревает/обновляет кэш явно и возвращает размер каталога — используется
// для массового обновления цен сразу по всем предметам в админке одним кликом.
export async function warmSkinportCache(): Promise<number> {
  cache = null; // форсируем свежую загрузку, игнорируя TTL
  const map = await loadCache();
  return map.size;
}
