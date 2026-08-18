import { env } from '../env.js';

// Уведомления владельцу о новых заказах — особенно важно в режиме ручной
// выдачи (см. tradeBot.ts), когда без этого узнать о заказе можно только
// зайдя в админку. Без токена/chat id работает в DRY_RUN — просто пишет в
// консоль сервера, чтобы можно было проверить текст сообщения без бота.
export async function notifyAdmin(text: string): Promise<void> {
  if (!env.telegram.configured) {
    console.log(`[DRY RUN] Telegram-уведомление (бот не настроен):\n${text}`);
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${env.telegram.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.telegram.chatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error(`[telegram] Не удалось отправить уведомление, статус ${res.status}`);
    }
  } catch (err: any) {
    // Сбой уведомления не должен ронять сам заказ/сервер — только логируем.
    console.error('[telegram] Не удалось отправить уведомление:', err.message ?? err);
  }
}
