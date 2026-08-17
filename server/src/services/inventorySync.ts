import { prisma } from '../db.js';
import { env } from '../env.js';

interface SteamAsset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
}

interface SteamTag {
  category: string;
  internal_name: string;
  localized_tag_name: string;
  color?: string;
}

interface SteamDescriptionFragment {
  type: string;
  value: string;
}

interface SteamDescription {
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

function getExterior(desc: SteamDescription): string | undefined {
  return desc.tags?.find((t) => t.category === 'Exterior')?.localized_tag_name;
}

function getCategory(desc: SteamDescription): string | undefined {
  return desc.tags?.find((t) => t.category === 'Type')?.localized_tag_name;
}

function getRarity(desc: SteamDescription): SteamTag | undefined {
  return desc.tags?.find((t) => t.category === 'Rarity');
}

// Steam кладёт наклеенные на оружие стикеры не отдельным полем, а HTML-блоком
// вида <div id="sticker_info">...<img src="..." title="Sticker: Имя">...</div>
// внутри одного из текстовых фрагментов описания предмета.
const STICKER_INFO_BLOCK = /<div id="sticker_info"[^>]*>([\s\S]*?)<\/div>/;
const STICKER_IMG = /<img[^>]*src="([^"]+)"[^>]*title="Sticker:\s*([^"]*?)"/g;

function getAppliedStickers(desc: SteamDescription): AppliedSticker[] {
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

async function fetchInventoryPage(startAssetId?: string): Promise<SteamInventoryResponse> {
  const params = new URLSearchParams({ l: 'english', count: String(PAGE_SIZE) });
  if (startAssetId) params.set('start_assetid', startAssetId);

  const url = `https://steamcommunity.com/inventory/${env.steamOwnerId64}/730/2?${params}`;
  const res = await fetch(url, { headers: STEAM_HEADERS, signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    throw new Error(`Steam inventory request failed with status code ${res.status}`);
  }
  return res.json();
}

export async function syncInventoryOnce() {
  const assets: SteamAsset[] = [];
  const descriptions: SteamDescription[] = [];
  let startAssetId: string | undefined;

  do {
    const page = await fetchInventoryPage(startAssetId);
    if (!page.success || !page.assets || !page.descriptions) {
      console.warn('[inventorySync] Steam вернул пустой или приватный инвентарь — проверьте, что инвентарь публичный');
      return;
    }
    assets.push(...page.assets);
    descriptions.push(...page.descriptions);
    startAssetId = page.more_items ? page.last_assetid : undefined;
  } while (startAssetId);

  const descByKey = new Map(descriptions.map((d) => [`${d.classid}_${d.instanceid}`, d]));
  const seenAssetIds: string[] = [];

  for (const asset of assets) {
    const desc = descByKey.get(`${asset.classid}_${asset.instanceid}`);
    if (!desc || !desc.tradable || !desc.marketable) continue;

    seenAssetIds.push(asset.assetid);

    const stickers = getAppliedStickers(desc);
    const stickersJson = stickers.length > 0 ? JSON.stringify(stickers) : null;
    const rarity = getRarity(desc);

    await prisma.item.upsert({
      where: { assetId: asset.assetid },
      create: {
        assetId: asset.assetid,
        classId: asset.classid,
        instanceId: asset.instanceid,
        marketHashName: desc.market_hash_name,
        name: desc.name,
        iconUrl: `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}`,
        exterior: getExterior(desc) ?? null,
        category: getCategory(desc) ?? null,
        rarity: rarity?.localized_tag_name ?? null,
        rarityColor: rarity?.color ?? null,
        tradable: !!desc.tradable,
        marketable: !!desc.marketable,
        stickersJson,
      },
      update: {
        category: getCategory(desc) ?? null,
        rarity: rarity?.localized_tag_name ?? null,
        rarityColor: rarity?.color ?? null,
        tradable: !!desc.tradable,
        marketable: !!desc.marketable,
        stickersJson,
      },
    });
  }

  // Если ранее "пропавший" предмет снова появился в инвентаре (например,
  // его вернули после трейда или предыдущий прогон синхронизации ошибочно
  // снял его с продажи из-за неполного ответа Steam) — возвращаем статус
  // автоматически, без вмешательства админа.
  if (seenAssetIds.length > 0) {
    await prisma.item.updateMany({
      where: { assetId: { in: seenAssetIds }, status: 'REMOVED' },
      data: { status: 'AVAILABLE' },
    });
  }

  const currentAvailableCount = await prisma.item.count({ where: { status: 'AVAILABLE' } });

  // Защита от затирания витрины на неполном/флейки ответе Steam — например,
  // временный 429 на части страниц пагинации. Если увидели заметно меньше
  // товаров, чем сейчас числится доступными, этот прогон считаем ненадёжным
  // и НЕ снимаем ничего с продажи: лучше показать чуть устаревшие данные,
  // чем ошибочно убрать реальные товары с витрины.
  const seemsUnreliable = currentAvailableCount > 0 && seenAssetIds.length < currentAvailableCount * 0.5;

  if (seemsUnreliable) {
    console.warn(
      `[inventorySync] Похоже на неполный ответ Steam (видно ${seenAssetIds.length} из ${currentAvailableCount} доступных товаров) — пропускаю снятие "пропавших" предметов в этот раз`,
    );
  } else {
    const missing = await prisma.item.findMany({
      where: { status: 'AVAILABLE', assetId: { notIn: seenAssetIds } },
    });

    for (const item of missing) {
      await prisma.item.update({ where: { id: item.id }, data: { status: 'REMOVED', listed: false } });
      console.log(`[inventorySync] ${item.marketHashName} (${item.assetId}) больше не в инвентаре — снят с продажи`);
    }
  }

  console.log(`[inventorySync] Синхронизировано предметов: ${seenAssetIds.length}`);
}

export function startInventorySync() {
  syncInventoryOnce().catch((err) => console.error('[inventorySync] Ошибка синхронизации', err.message ?? err));
  setInterval(() => {
    syncInventoryOnce().catch((err) => console.error('[inventorySync] Ошибка синхронизации', err.message ?? err));
  }, env.inventorySyncIntervalMs);
}
