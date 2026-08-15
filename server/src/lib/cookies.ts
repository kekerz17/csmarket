import type { CookieOptions } from 'express';
import { env } from '../env.js';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Фронтенд и бэкенд могут жить на разных доменах (например, два отдельных
// сервиса Render) — тогда браузер считает запросы между ними "cross-site" и
// требует SameSite=None + Secure, иначе просто не пришлёт cookie обратно.
// Локально (оба на localhost) — обычный SameSite=Lax работает и не требует HTTPS.
const isCrossOrigin = hostOf(env.clientUrl) !== hostOf(env.publicApiUrl);

export function authCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: isCrossOrigin ? 'none' : 'lax',
    secure: isCrossOrigin,
    maxAge,
  };
}
