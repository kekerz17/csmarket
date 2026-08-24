import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { env } from './env.js';
import passport from './services/passport.js';
import catalogRouter from './routes/catalog.js';
import ordersRouter from './routes/orders.js';
import webhooksRouter from './routes/webhooks.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import depositsRouter from './routes/deposits.js';
import purchasesRouter from './routes/purchases.js';
import settingsRouter from './routes/settings.js';
import presenceRouter from './routes/presence.js';
import sellRouter from './routes/sell.js';
import referralsRouter from './routes/referrals.js';
import { startInventorySync } from './services/inventorySync.js';
import { startBot } from './services/tradeBot.js';
import { startDepositExpiryWatcher } from './services/depositExpiry.js';

// Страховка: без этого одна необработанная ошибка промиса (например, сбой
// сети при обращении к NOWPayments/Steam) по умолчанию в Node 15+ убивает
// весь процесс сервера — падает вообще всё (каталог, логин, покупки), а не
// только тот один запрос, который не повезло обработать. Ошибку логируем,
// но процесс не завершаем — конкретные роуты по-прежнему должны сами ловить
// свои ошибки try/catch (это лишь последний рубеж, а не замена этому).
process.on('unhandledRejection', (reason) => {
  console.error('[server] Необработанный reject промиса:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[server] Необработанное исключение:', err);
});

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Сессия нужна только на время OpenID-хендшейка со Steam (хранит state/nonce
// между редиректом на steamcommunity.com и возвратом обратно) — постоянная
// авторизация покупателя после этого держится на собственном JWT-cookie
// (user_token), а не на этой сессии.
app.use(session({ secret: env.sessionSecret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());

app.use('/api/items', catalogRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/deposits', depositsRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/presence', presenceRouter);
app.use('/api/sell', sellRouter);
app.use('/api/referrals', referralsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(env.port, () => {
  console.log(`[server] Слушаю на http://localhost:${env.port}`);
  if (!env.admin.passwordHash) {
    console.warn('[server] ADMIN_PASSWORD_HASH не задан — вход в /admin невозможен. См. README.');
  }
  if (!env.steam.apiKey) {
    console.warn('[server] STEAM_API_KEY не задан — настоящий Steam-логин покупателей отключён (см. /api/auth/dev-login).');
  }
  startBot();
  startInventorySync();
  startDepositExpiryWatcher();
});
