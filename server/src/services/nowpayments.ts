import axios from 'axios';
import crypto from 'crypto';
import { env } from '../env.js';

interface OrderLike {
  id: string;
  priceUsd: number;
}

interface InvoiceResult {
  id: string;
  invoice_url: string;
  dryRun?: boolean;
}

export async function createInvoice(order: OrderLike): Promise<InvoiceResult> {
  if (!env.nowPayments.configured) {
    console.warn(`[DRY RUN] NOWPayments не настроен — выдаём фейковый инвойс для заказа ${order.id}`);
    return {
      id: `dryrun_${order.id}`,
      invoice_url: `${env.clientUrl}/order/${order.id}`,
      dryRun: true,
    };
  }

  try {
    const { data } = await axios.post(
      `${env.nowPayments.baseUrl}/invoice`,
      {
        price_amount: order.priceUsd,
        price_currency: 'usd',
        // pay_currency намеренно не указываем: тикер вида "usdt" без сети
        // (trc20/erc20/...) NOWPayments не принимает и вернёт 400 — а
        // жёстко указывать конкретную сеть нельзя, т.к. она должна быть
        // отдельно включена в настройках мерчант-кабинета. Без этого поля
        // NOWPayments сам покажет покупателю выбор сети на странице оплаты
        // из тех валют, что включены в кабинете — это штатный сценарий.
        order_id: order.id,
        order_description: `Girgich Store — заказ ${order.id}`,
        ipn_callback_url: `${env.publicApiUrl}/api/webhooks/nowpayments`,
        success_url: `${env.clientUrl}/order/${order.id}`,
        cancel_url: `${env.clientUrl}/order/${order.id}`,
      },
      {
        headers: {
          'x-api-key': env.nowPayments.apiKey!,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );

    return data;
  } catch (err: any) {
    // Сетевая/TLS-ошибка сюда не долетит как обычный reject без явного
    // catch — а без него один сбой запроса к NOWPayments мог уронить
    // весь процесс сервера целиком (см. также глобальный перехватчик в index.ts).
    console.error(
      '[nowpayments] Не удалось создать инвойс:',
      err.response?.data ? JSON.stringify(err.response.data) : (err.message ?? err),
    );
    throw new Error('Платёжный сервис временно недоступен, попробуйте ещё раз через пару минут');
  }
}

function sortObject(value: any): any {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc: Record<string, any>, key) => {
        acc[key] = sortObject(value[key]);
        return acc;
      }, {});
  }
  return value;
}

export function verifyIpnSignature(body: unknown, signature: string | null | undefined): boolean {
  if (!env.nowPayments.configured) {
    console.warn('[DRY RUN] NOWPayments не настроен — подпись webhook не проверяется');
    return true;
  }
  if (!signature) return false;

  const hmac = crypto.createHmac('sha512', env.nowPayments.ipnSecret!);
  hmac.update(JSON.stringify(sortObject(body)));
  const expected = hmac.digest('hex');

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signature);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
