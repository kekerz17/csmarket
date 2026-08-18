// В деплое фронтенд и бэкенд обычно живут на разных доменах (два отдельных
// сервиса Render) — тогда относительный путь "/api" уйдёт на сам фронтенд, а
// не на бэкенд. VITE_API_URL — полный адрес бэкенда, задаётся при билде
// (Environment у Static Site в Render). Локально не задан — работает как
// раньше, через прокси Vite (см. client/vite.config.ts).
export const API_ORIGIN = import.meta.env.VITE_API_URL ?? '';
const BASE = `${API_ORIGIN}/api`;

// Запасной канал авторизации в дополнение к cookie — см. userAuth.ts на
// бэкенде: часть браузеров блокирует cross-site cookie между доменами
// фронтенда и бэкенда, а localStorage + заголовок Authorization это обходит.
const TOKEN_KEY = 'user_token';
export const getUserToken = () => localStorage.getItem(TOKEN_KEY);
export const setUserToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearUserToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getUserToken();
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body.error === 'string' ? body.error : JSON.stringify(body.error ?? `HTTP ${res.status}`));
  }
  return res.json();
}

export interface Sticker {
  slot: number;
  name: string;
  iconUrl: string;
}

export interface Item {
  id: string;
  assetId: string;
  marketHashName: string;
  name: string;
  iconUrl: string;
  exterior: string | null;
  category: string | null;
  rarity: string | null;
  rarityColor: string | null;
  floatValue: number | null;
  floatSource: 'gc' | 'simulated' | null;
  stickersJson: string | null;
  priceUsd: number | null;
  suggestedMarketPrice: number | null;
  listed: boolean;
  status: string;
}

export function parseStickers(item: Pick<Item, 'stickersJson'>): Sticker[] {
  if (!item.stickersJson) return [];
  try {
    return JSON.parse(item.stickersJson);
  } catch {
    return [];
  }
}

// Скидка считается на лету от последней подтянутой рыночной цены — отдельно
// в БД не хранится, чтобы не рассинхронизироваться с priceUsd/suggestedMarketPrice.
export function getDiscountPercent(item: Pick<Item, 'priceUsd' | 'suggestedMarketPrice'>): number | null {
  if (item.priceUsd == null || !item.suggestedMarketPrice) return null;
  if (item.priceUsd >= item.suggestedMarketPrice) return null;
  const pct = ((item.suggestedMarketPrice - item.priceUsd) / item.suggestedMarketPrice) * 100;
  return Math.round(pct);
}

export interface User {
  id: string;
  steamId64: string;
  personaName: string;
  avatarUrl: string;
  tradeUrl: string | null;
  balanceUsd: number;
}

export interface Deposit {
  id: string;
  userId: string;
  amountUsd: number;
  status: string;
  createdAt: string;
}

export interface Order {
  id: string;
  itemId: string;
  item: Item;
  userId: string;
  user?: User;
  priceUsd: number;
  status: string;
  tradeOfferId: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface BotStatus {
  online: boolean;
  dryRun: boolean;
  steamId: string | null;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface ExchangeRates {
  RUB: number;
  EUR: number;
}

export const api = {
  listItems: (params?: { search?: string; minPrice?: number; maxPrice?: number; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.minPrice) qs.set('minPrice', String(params.minPrice));
    if (params?.maxPrice) qs.set('maxPrice', String(params.maxPrice));
    if (params?.category) qs.set('category', params.category);
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<Item[]>(`/items${suffix}`);
  },
  listCategories: () => request<CategoryCount[]>('/items/meta/categories'),
  getExchangeRates: () => request<ExchangeRates>('/settings/exchange-rates'),
  getItem: (assetId: string) => request<Item>(`/items/${assetId}`),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),

  // --- Покупатель: авторизация через Steam --------------------------------
  me: () => request<User>('/auth/me'),
  devLogin: (personaName: string) =>
    request<{ ok: true }>('/auth/dev-login', { method: 'POST', body: JSON.stringify({ personaName }) }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  updateTradeUrl: (tradeUrl: string) =>
    request<User>('/auth/me/trade-url', { method: 'PATCH', body: JSON.stringify({ tradeUrl }) }),
  myOrders: () => request<Order[]>('/auth/me/orders'),

  // --- Баланс/депозиты -----------------------------------------------------
  createDeposit: (amountUsd: number) =>
    request<{ depositId: string; invoiceUrl: string; dryRun: boolean }>('/deposits', {
      method: 'POST',
      body: JSON.stringify({ amountUsd }),
    }),
  getDeposit: (id: string) => request<Deposit>(`/deposits/${id}`),

  // --- Покупка предмета с баланса -------------------------------------------
  purchase: (assetId: string) =>
    request<{ orderId: string }>('/purchases', { method: 'POST', body: JSON.stringify({ assetId }) }),

  // --- Админка ---------------------------------------------------------------
  adminLogin: (password: string) =>
    request<{ ok: true }>('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  adminLogout: () => request<{ ok: true }>('/admin/logout', { method: 'POST' }),
  adminListItems: () => request<Item[]>('/admin/items'),
  adminUpdateItem: (id: string, data: Partial<Pick<Item, 'priceUsd' | 'listed'>>) =>
    request<Item>(`/admin/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminSuggestPrice: (id: string) => request<Item>(`/admin/items/${id}/suggest-price`, { method: 'POST' }),
  adminRefreshAllPrices: () =>
    request<{ total: number; updated: number }>('/admin/items/refresh-all-prices', { method: 'POST' }),
  adminRefreshFloat: (id: string) => request<Item>(`/admin/items/${id}/refresh-float`, { method: 'POST' }),
  adminListOrders: () => request<Order[]>('/admin/orders'),
  adminBotStatus: () => request<BotStatus>('/admin/bot-status'),
  adminFulfillOrder: (id: string, action: 'sent' | 'completed' | 'failed') =>
    request<Order>(`/admin/orders/${id}/fulfill`, { method: 'POST', body: JSON.stringify({ action }) }),
  adminGetExchangeRates: () => request<ExchangeRates>('/admin/settings/exchange-rates'),
  adminSetExchangeRates: (rates: ExchangeRates) =>
    request<ExchangeRates>('/admin/settings/exchange-rates', { method: 'PATCH', body: JSON.stringify(rates) }),
};
