import { Router } from 'express';
import { prisma } from '../db.js';
import { verifyIpnSignature } from '../services/nowpayments.js';

const router = Router();

router.post('/nowpayments', async (req, res) => {
  const signature = req.header('x-nowpayments-sig');
  if (!verifyIpnSignature(req.body, signature)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  const { order_id: depositId, payment_status: paymentStatus, payment_id: paymentId } = req.body ?? {};
  if (!depositId) {
    res.status(400).json({ error: 'Missing order_id' });
    return;
  }

  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
  if (!deposit) {
    res.status(404).json({ error: 'Deposit not found' });
    return;
  }

  if (['finished', 'confirmed'].includes(paymentStatus) && deposit.status === 'PENDING') {
    await prisma.$transaction([
      prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'COMPLETED', nowpaymentsPaymentId: String(paymentId ?? '') },
      }),
      prisma.user.update({
        where: { id: deposit.userId },
        data: { balanceUsd: { increment: deposit.amountUsd } },
      }),
    ]);
    console.log(`[webhooks] Депозит ${deposit.id} зачислен: +$${deposit.amountUsd}`);
  } else if (['failed', 'expired', 'refunded'].includes(paymentStatus)) {
    await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'FAILED' } });
  }

  res.json({ received: true });
});

export default router;
