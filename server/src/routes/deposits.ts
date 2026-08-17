import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { userAuth } from '../middleware/userAuth.js';
import { createInvoice } from '../services/nowpayments.js';

const router = Router();

router.use(userAuth);

const createDepositSchema = z.object({ amountUsd: z.number().positive().min(1).max(100000) });

router.post('/', async (req, res) => {
  const parsed = createDepositSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const deposit = await prisma.deposit.create({
    data: { userId: req.userId!, amountUsd: parsed.data.amountUsd, status: 'PENDING' },
  });

  try {
    const invoice = await createInvoice({ id: deposit.id, priceUsd: deposit.amountUsd });
    await prisma.deposit.update({ where: { id: deposit.id }, data: { nowpaymentsInvoiceId: invoice.id } });
    res.status(201).json({ depositId: deposit.id, invoiceUrl: invoice.invoice_url, dryRun: invoice.dryRun ?? false });
  } catch (err: any) {
    await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'FAILED' } });
    res.status(502).json({ error: err.message ?? 'Не удалось создать счёт на оплату' });
  }
});

router.get('/:id', async (req, res) => {
  const deposit = await prisma.deposit.findUnique({ where: { id: req.params.id } });
  if (!deposit || deposit.userId !== req.userId) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  res.json(deposit);
});

export default router;
