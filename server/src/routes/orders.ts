import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/:id', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { item: true } });
  if (!order) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  res.json(order);
});

export default router;
