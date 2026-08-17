import { Router } from 'express';
import { getExchangeRates } from '../lib/settings.js';

const router = Router();

router.get('/exchange-rates', async (_req, res) => {
  res.json(await getExchangeRates());
});

export default router;
