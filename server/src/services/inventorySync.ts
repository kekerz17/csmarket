import { prisma } from '../db.js';
import { env } from '../env.js';
import { fetchFullInventory, getExterior, getCategory, getRarity, getAppliedStickers } from './steamInventory.js';

// Синхронизирует один Steam-аккаунт. "Пропавшие"/появившиеся предметы
// считаются отдельно для каждого аккаунта — иначе временный сбой Steam на
// одном из нескольких аккаунтов мог бы испортить безопасный порог (см. ниже)
// и для остальных.
async function syncOneOwner(ownerSteamId64: string) {
  const inventory = await fetchFullInventory(ownerSteamId64);
  if (!inventory) {
    console.warn(
      `[inventorySync] Steam вернул пустой или приватный инвентарь для ${ownerSteamId64} — проверьте, что инвентарь публичный`,
    );
    return;
  }

  const { assets, descByKey } = inventory;
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
        ownerSteamId64,
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
        ownerSteamId64,
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
      where: { assetId: { in: seenAssetIds }, status: 'REMOVED', ownerSteamId64 },
      data: { status: 'AVAILABLE' },
    });
  }

  const currentAvailableCount = await prisma.item.count({ where: { status: 'AVAILABLE', ownerSteamId64 } });

  // Защита от затирания витрины на неполном/флейки ответе Steam — например,
  // временный 429 на части страниц пагинации. Если увидели заметно меньше
  // товаров, чем сейчас числится доступными у этого аккаунта, этот прогон
  // считаем ненадёжным и НЕ снимаем ничего с продажи: лучше показать чуть
  // устаревшие данные, чем ошибочно убрать реальные товары с витрины.
  const seemsUnreliable = currentAvailableCount > 0 && seenAssetIds.length < currentAvailableCount * 0.5;

  if (seemsUnreliable) {
    console.warn(
      `[inventorySync] Похоже на неполный ответ Steam для ${ownerSteamId64} (видно ${seenAssetIds.length} из ${currentAvailableCount} доступных товаров) — пропускаю снятие "пропавших" предметов в этот раз`,
    );
  } else {
    const missing = await prisma.item.findMany({
      where: { status: 'AVAILABLE', ownerSteamId64, assetId: { notIn: seenAssetIds } },
    });

    for (const item of missing) {
      await prisma.item.update({ where: { id: item.id }, data: { status: 'REMOVED', listed: false } });
      console.log(`[inventorySync] ${item.marketHashName} (${item.assetId}) больше не в инвентаре ${ownerSteamId64} — снят с продажи`);
    }
  }

  console.log(`[inventorySync] ${ownerSteamId64}: синхронизировано предметов: ${seenAssetIds.length}`);
}

export async function syncInventoryOnce() {
  for (const ownerSteamId64 of env.steamOwnerIds) {
    await syncOneOwner(ownerSteamId64);
  }
}

export function startInventorySync() {
  syncInventoryOnce().catch((err) => console.error('[inventorySync] Ошибка синхронизации', err.message ?? err));
  setInterval(() => {
    syncInventoryOnce().catch((err) => console.error('[inventorySync] Ошибка синхронизации', err.message ?? err));
  }, env.inventorySyncIntervalMs);
}
