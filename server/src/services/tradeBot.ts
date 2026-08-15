import crypto from 'crypto';
import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamTotp from 'steam-totp';
import GlobalOffensive from 'globaloffensive';
import { env } from '../env.js';
import { prisma } from '../db.js';

interface BotStatus {
  online: boolean;
  dryRun: boolean;
  steamId: string | null;
  gcConnected: boolean;
}

const status: BotStatus = { online: false, dryRun: !env.steam.configured, steamId: null, gcConnected: false };

let client: any = null;
let community: any = null;
let manager: any = null;
let csgo: any = null;

export function getBotStatus(): BotStatus {
  return status;
}

export function startBot() {
  if (!env.steam.configured) {
    console.warn('[DRY RUN] Steam-бот не настроен (нет учётных данных) — выдача скинов будет эмулироваться.');
    return;
  }

  client = new SteamUser();
  community = new SteamCommunity();
  manager = new TradeOfferManager({ steam: client, community, language: 'en' });
  csgo = new GlobalOffensive(client);

  client.logOn({
    accountName: env.steam.username,
    password: env.steam.password,
    twoFactorCode: SteamTotp.generateAuthCode(env.steam.sharedSecret!),
  });

  client.on('loggedOn', () => {
    status.online = true;
    status.steamId = client.steamID?.getSteamID64() ?? null;
    console.log(`[tradeBot] Успешный логин: ${status.steamId}`);
    // Нужна активная "игровая сессия" в CS2, иначе Game Coordinator не отвечает.
    client.gamesPlayed([730]);
  });

  csgo.on('connectedToGC', () => {
    status.gcConnected = true;
    console.log('[tradeBot] Подключение к CS2 Game Coordinator установлено (для получения float)');
  });

  csgo.on('disconnectedFromGC', () => {
    status.gcConnected = false;
  });

  client.on('webSession', (_sessionId: string, cookies: string[]) => {
    community.setCookies(cookies);
    manager.setCookies(cookies);
  });

  client.on('error', (err: Error) => {
    status.online = false;
    console.error('[tradeBot] SteamUser error:', err);
  });

  client.on('disconnected', () => {
    status.online = false;
  });

  manager.on('sentOfferChanged', async (offer: any) => {
    const order = await prisma.order.findFirst({ where: { tradeOfferId: String(offer.id) } });
    if (!order) return;

    if (offer.state === TradeOfferManager.ETradeOfferState.Accepted) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } });
      await prisma.item.update({ where: { id: order.itemId }, data: { status: 'SOLD' } });
      console.log(`[tradeBot] Заказ ${order.id} завершён — покупатель принял трейд`);
      return;
    }

    const terminalFailureStates = [
      TradeOfferManager.ETradeOfferState.Declined,
      TradeOfferManager.ETradeOfferState.Canceled,
      TradeOfferManager.ETradeOfferState.Expired,
      TradeOfferManager.ETradeOfferState.InvalidItems,
      TradeOfferManager.ETradeOfferState.CounteredBack,
    ];
    if (terminalFailureStates.includes(offer.state)) {
      const stateName = TradeOfferManager.ETradeOfferState[offer.state];
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED', failureReason: `Trade offer ${stateName}` },
        }),
        prisma.item.update({ where: { id: order.itemId }, data: { status: 'AVAILABLE' } }),
        // Деньги уже списаны с баланса при покупке — раз трейд не дошёл, возвращаем их.
        prisma.user.update({ where: { id: order.userId }, data: { balanceUsd: { increment: order.priceUsd } } }),
      ]);
      console.warn(`[tradeBot] Заказ ${order.id} провалился: ${stateName}, деньги возвращены на баланс`);
    }
  });
}

export async function sendItem(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { item: true, user: true } });
  if (!order) return;

  if (!env.steam.configured || !manager) {
    console.warn(`[DRY RUN] Симулируем отправку "${order.item.name}" на ${order.user.tradeUrl} (заказ ${order.id})`);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'TRADE_SENT', tradeOfferId: `dryrun_${order.id}` },
    });
    setTimeout(async () => {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } });
      await prisma.item.update({ where: { id: order.itemId }, data: { status: 'SOLD' } });
      console.log(`[DRY RUN] Заказ ${order.id} помечен COMPLETED (симуляция принятия трейда)`);
    }, 5000);
    return;
  }

  const offer = manager.createOffer(order.user.tradeUrl);
  offer.addMyItem({ assetid: order.item.assetId, appid: 730, contextid: 2 });
  offer.setMessage('Спасибо за покупку! Скин отправлен автоматически.');

  offer.send(async (err: Error | null, offerStatus: string) => {
    if (err) {
      console.error('[tradeBot] Не удалось отправить трейд-оффер:', err);
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED', failureReason: String(err.message ?? err) },
        }),
        prisma.item.update({ where: { id: order.itemId }, data: { status: 'AVAILABLE' } }),
        prisma.user.update({ where: { id: order.userId }, data: { balanceUsd: { increment: order.priceUsd } } }),
      ]);
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'TRADE_SENT', tradeOfferId: String(offer.id) },
    });

    if (offerStatus === 'pending') {
      community.acceptConfirmationForObject(env.steam.identitySecret, offer.id, (confirmErr: Error | null) => {
        if (confirmErr) console.error('[tradeBot] Не удалось подтвердить трейд через мобильный аутентификатор:', confirmErr);
      });
    }
  });
}

// Float — это не публичные данные Steam, а часть protobuf-ответа от Game
// Coordinator CS2 (тот же сервис, что обслуживает саму игру). Достать его
// можно только через живую игровую сессию бота — обычного HTTP-запроса для
// этого не существует в принципе.
const EXTERIOR_RANGES: Record<string, [number, number]> = {
  'Factory New': [0, 0.07],
  'Minimal Wear': [0.07, 0.15],
  'Field-Tested': [0.15, 0.38],
  'Well-Worn': [0.38, 0.45],
  'Battle-Scarred': [0.45, 1],
};

function dryRunFloat(item: { assetId: string; exterior: string | null }): number {
  const [min, max] = (item.exterior && EXTERIOR_RANGES[item.exterior]) || [0, 1];
  const hash = crypto.createHash('md5').update(item.assetId).digest();
  const fraction = hash.readUInt32BE(0) / 0xffffffff;
  const value = Number((min + fraction * (max - min)).toFixed(6));
  console.warn(`[DRY RUN] Float для ${item.assetId} сгенерирован псевдослучайно (реальных данных нет): ${value}`);
  return value;
}

function paintWearToFloat(raw: number): number {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(raw >>> 0, 0);
  return buf.readFloatLE(0);
}

let lastInspectAt = 0;
const INSPECT_MIN_INTERVAL_MS = 1500;
const INSPECT_TIMEOUT_MS = 10000;

export interface FloatResult {
  value: number | null;
  // 'gc' — реальные данные с Game Coordinator; 'simulated' — DRY_RUN-заглушка.
  // Обязательно проверяйте это поле перед показом float покупателю.
  source: 'gc' | 'simulated';
}

export async function getFloat(item: { assetId: string; exterior: string | null }): Promise<FloatResult> {
  if (!env.steam.configured || !csgo) {
    return { value: dryRunFloat(item), source: 'simulated' };
  }
  if (!status.gcConnected) {
    console.warn('[tradeBot] Game Coordinator ещё не подключен — float временно недоступен, попробуйте ещё раз через пару секунд');
    return { value: null, source: 'gc' };
  }

  const wait = lastInspectAt + INSPECT_MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastInspectAt = Date.now();

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      csgo.removeListener('inspectItemInfo', onInfo);
      console.warn(`[tradeBot] GC не ответил по float для ${item.assetId} за ${INSPECT_TIMEOUT_MS}мс`);
      resolve({ value: null, source: 'gc' });
    }, INSPECT_TIMEOUT_MS);

    function onInfo(data: any) {
      if (String(data.itemid ?? data.id) !== String(item.assetId)) return;
      clearTimeout(timeout);
      csgo.removeListener('inspectItemInfo', onInfo);
      resolve({ value: typeof data.paintwear === 'number' ? paintWearToFloat(data.paintwear) : null, source: 'gc' });
    }

    csgo.on('inspectItemInfo', onInfo);
    // Бот инспектирует предмет из СВОЕГО ЖЕ инвентаря (owner === бот), поэтому
    // GC не требует подписанного inspect-токена (d), в отличие от инспекции
    // чужих предметов через маркет/трейд-ссылку.
    csgo.inspectItem(status.steamId, item.assetId, '0');
  });
}
