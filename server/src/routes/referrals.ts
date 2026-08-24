import { Router } from 'express';
import { prisma } from '../db.js';
import { userAuth } from '../middleware/userAuth.js';
import { getReferralPercent } from '../lib/settings.js';
import { env } from '../env.js';

const router = Router();

router.use(userAuth);

router.get('/stats', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const [percent, referred, earnings] = await Promise.all([
    getReferralPercent(),
    prisma.user.findMany({
      where: { referredById: user.id },
      select: { id: true, steamId64: true, personaName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.referralEarning.groupBy({
      by: ['referredUserId'],
      where: { referrerId: user.id },
      _sum: { amountUsd: true },
    }),
  ]);

  const earnedByUser = new Map(earnings.map((e) => [e.referredUserId, e._sum.amountUsd ?? 0]));
  const totalEarnedUsd = earnings.reduce((sum, e) => sum + (e._sum.amountUsd ?? 0), 0);

  res.json({
    percent,
    totalEarnedUsd,
    referredCount: referred.length,
    referralLink: `${env.clientUrl}/?ref=${user.referralCode}`,
    referrals: referred.map((r) => ({
      steamId64: r.steamId64,
      personaName: r.personaName,
      joinedAt: r.createdAt,
      earnedUsd: earnedByUser.get(r.id) ?? 0,
    })),
  });
});

export default router;
