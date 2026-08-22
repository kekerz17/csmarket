// Общая логика получения и разбора публичного инвентаря CS2 со Steam —
// используется и для синхронизации витрины (inventorySync.ts, инвентари
// владельца), и для показа пользователю его СОБСТВЕННЫХ предметов на
// продажу (sell.ts). Вынесено сюда, чтобы не дублировать HTTP-заголовки,
// пагинацию и разбор тегов/стикеров в двух местах.

export interface SteamAsset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
}

export interface SteamTag {
  category: string;
  internal_name: string;
  localized_tag_name: string;
  color?: string;
}

interface SteamDescriptionFragment {
  type: string;
  value: string;
}

export interface SteamDescription {
  classid: string;
  instanceid: string;
  market_hash_name: string;
  name: string;
  icon_url: string;
  tradable: number;
  marketable: number;
  tags?: SteamTag[];
  descriptions?: SteamDescriptionFragment[];
}

export interface AppliedSticker {
  slot: number;
  name: string;
  iconUrl: string;
}

interface SteamInventoryResponse {
  assets?: SteamAsset[];
  descriptions?: SteamDescription[];
  success: number;
  more_items?: number;
  last_assetid?: string;
}

// Steam возвращает HTTP 400/429 без полноценных браузерных заголовков (даже
// для публичного инвентаря) и при count больше ~2000 за раз. Используем
// встроенный fetch (undici), а не axios — у axios в Node другой HTTP/TLS
// отпечаток, и Steam режет его запросы гораздо агрессивнее.
const STEAM_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://steamcommunity.com/',
};
const PAGE_SIZE = 2000;

export function getExterior(desc: SteamDescription): string | undefined {
  return desc.tags?.find((t) => t.category === 'Exterior')?.localized_tag_name;
}

export function getCategory(desc: SteamDescription): string | undefined {
  return desc.tags?.find((t) => t.category === 'Type')?.localized_tag_name;
}

export function getRarity(desc: SteamDescription): SteamTag | undefined {
  return desc.tags?.find((t) => t.category === 'Rarity');
}

// Steam кладёт наклеенные на оружие стикеры не отдельным полем, а HTML-блоком
// вида <div id="sticker_info">...<img src="..." title="Sticker: Имя">...</div>
// внутри одного из текстовых фрагментов описания предмета.
const STICKER_INFO_BLOCK = /<div id="sticker_info"[^>]*>([\s\S]*?)<\/div>/;
const STICKER_IMG = /<img[^>]*src="([^"]+)"[^>]*title="Sticker:\s*([^"]*?)"/g;

export function getAppliedStickers(desc: SteamDescription): AppliedSticker[] {
  const block = desc.descriptions?.find((d) => d.value?.includes('id="sticker_info"'));
  if (!block) return [];

  const html = STICKER_INFO_BLOCK.exec(block.value)?.[1];
  if (!html) return [];

  const stickers: AppliedSticker[] = [];
  let match: RegExpExecArray | null;
  STICKER_IMG.lastIndex = 0;
  let slot = 0;
  while ((match = STICKER_IMG.exec(html))) {
    stickers.push({ slot: slot++, iconUrl: match[1], name: match[2] });
  }
  return stickers;
}

async function fetchInventoryPage(steamId64: string, startAssetId?: string): Promise<SteamInventoryResponse> {
  const params = new URLSearchParams({ l: 'english', count: String(PAGE_SIZE) });
  if (startAssetId) params.set('start_assetid', startAssetId);

  const url = `https://steamcommunity.com/inventory/${steamId64}/730/2?${params}`;
  const res = await fetch(url, { headers: STEAM_HEADERS, signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    throw new Error(`Steam inventory request failed with status code ${res.status}`);
  }
  return res.json();
}

export interface FullInventory {
  assets: SteamAsset[];
  descByKey: Map<string, SteamDescription>;
}

// Возвращает null, если инвентарь приватный/пустой (Steam отвечает success:0
// или без assets/descriptions) — вызывающий код сам решает, как это подать
// пользователю (для владельца — предупреждение в лог, для продавца — ошибку).
export async function fetchFullInventory(steamId64: string): Promise<FullInventory | null> {
  const assets: SteamAsset[] = [];
  const descriptions: SteamDescription[] = [];
  let startAssetId: string | undefined;

  do {
    const page = await fetchInventoryPage(steamId64, startAssetId);
    if (!page.success || !page.assets || !page.descriptions) {
      return null;
    }
    assets.push(...page.assets);
    descriptions.push(...page.descriptions);
    startAssetId = page.more_items ? page.last_assetid : undefined;
  } while (startAssetId);

  const descByKey = new Map(descriptions.map((d) => [`${d.classid}_${d.instanceid}`, d]));
  return { assets, descByKey };
}
