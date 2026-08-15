import { prisma } from '../db.js';
import { env } from '../env.js';

export function startDepositExpiryWatcher() {
  setInterval(async () => {
    const cutoff = new Date(Date.now() - env.depositReservationMinutes * 60 * 1000);
    const stale = await prisma.deposit.findMany({
      where: { status: 'PENDING', createdAt: { lt: cutoff } },
    });

    for (const deposit of stale) {
      await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'EXPIRED' } });
      console.log(`[depositExpiry] Депозит ${deposit.id} истёк без оплаты`);
    }
  }, 60 * 1000);
}
