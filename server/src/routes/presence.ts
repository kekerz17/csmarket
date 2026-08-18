import { Router } from 'express';

const router = Router();

// Считаем "онлайн" реально, а не показываем случайное число: каждый открытый
// сайт в браузере шлёт heartbeat раз в 20с с собственным id (localStorage,
// не привязан к логину). Онлайн — это те id, что стучались за последние 45с.
// Храним в памяти процесса — отдельной БД/Redis для этого не нужно.
const ACTIVE_WINDOW_MS = 45_000;
const sessions = new Map<string, number>();

function activeCount(): number {
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;
  for (const [id, lastSeen] of sessions) {
    if (lastSeen < cutoff) sessions.delete(id);
  }
  return sessions.size;
}

router.post('/heartbeat', (req, res) => {
  const id = req.body?.id;
  if (typeof id === 'string' && id.length > 0 && id.length <= 100) {
    sessions.set(id, Date.now());
  }
  res.json({ online: activeCount() });
});

export default router;
