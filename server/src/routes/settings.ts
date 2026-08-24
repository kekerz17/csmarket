import { Router } from 'express';
import { getExchangeRates, getSellSettings } from '../lib/settings.js';

const router = Router();

router.get('/exchange-rates', async (_req, res) => {
  res.json(await getExchangeRates());
});

// Публично — но процент выкупа (buybackPercent) намеренно не отдаём здесь:
// владелец сайта считает его конфиденциальным. Минимальная цена и
// trade-ссылка нужны на странице продажи ещё до входа через Steam.
router.get('/sell', async (_req, res) => {
  const { minPriceUsd, receivingTradeUrl } = await getSellSettings();
  res.json({ minPriceUsd, receivingTradeUrl });
});

export default router;
