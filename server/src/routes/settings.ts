import { Router } from 'express';
import { getExchangeRates, getSellSettings } from '../lib/settings.js';

const router = Router();

router.get('/exchange-rates', async (_req, res) => {
  res.json(await getExchangeRates());
});

// Публично — условия выкупа нужно показать на странице продажи ещё до
// входа через Steam (сколько платим и от какой суммы), это не секрет.
router.get('/sell', async (_req, res) => {
  res.json(await getSellSettings());
});

export default router;
