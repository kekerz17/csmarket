import 'dotenv/config';

const port = Number(process.env.PORT ?? 4000);

export const env = {
  port,
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  publicApiUrl: process.env.PUBLIC_API_URL ?? `http://localhost:${port}`,
  steamOwnerId64: process.env.STEAM_OWNER_ID64 ?? '76561199144809767',
  // Сайт может продавать предметы сразу из нескольких Steam-аккаунтов —
  // основной задаётся STEAM_OWNER_ID64 (как раньше), а дополнительные через
  // запятую в STEAM_OWNER_ID64_EXTRA, напр. "76561199114531166,765611...".
  get steamOwnerIds(): string[] {
    const primary = process.env.STEAM_OWNER_ID64 ?? '76561199144809767';
    const extra = (process.env.STEAM_OWNER_ID64_EXTRA ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    return Array.from(new Set([primary, ...extra]));
  },
  // По умолчанию раз в сутки — синхронизация чаще нужна редко (инвентарь
  // продавца не меняется поминутно), а более частые опросы Steam увеличивают
  // риск временных 429 от Steam на нестабильных/дата-центровых IP.
  inventorySyncIntervalMs: Number(process.env.INVENTORY_SYNC_INTERVAL_MS ?? 24 * 60 * 60 * 1000),
  // Через сколько минут неоплаченный депозит (пополнение баланса) считается
  // просроченным. Заказы больше не ждут оплату — оплата атомарна за счёт баланса.
  depositReservationMinutes: Number(process.env.DEPOSIT_RESERVATION_MINUTES ?? 30),
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-insecure-session-secret-change-me',

  admin: {
    passwordHash: process.env.ADMIN_PASSWORD_HASH ?? '',
    jwtSecret: process.env.ADMIN_JWT_SECRET ?? 'dev-insecure-secret-change-me',
  },

  user: {
    jwtSecret: process.env.USER_JWT_SECRET ?? 'dev-insecure-user-secret-change-me',
  },

  nowPayments: {
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
    baseUrl: process.env.NOWPAYMENTS_BASE_URL ?? 'https://api.nowpayments.io/v1',
    get configured() {
      return !!(process.env.NOWPAYMENTS_API_KEY && process.env.NOWPAYMENTS_IPN_SECRET);
    },
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    get configured() {
      return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
    },
  },

  steam: {
    username: process.env.STEAM_BOT_USERNAME,
    password: process.env.STEAM_BOT_PASSWORD,
    sharedSecret: process.env.STEAM_SHARED_SECRET,
    identitySecret: process.env.STEAM_IDENTITY_SECRET,
    apiKey: process.env.STEAM_API_KEY,
    get configured() {
      return !!(
        process.env.STEAM_BOT_USERNAME &&
        process.env.STEAM_BOT_PASSWORD &&
        process.env.STEAM_SHARED_SECRET &&
        process.env.STEAM_IDENTITY_SECRET
      );
    },
  },
};
