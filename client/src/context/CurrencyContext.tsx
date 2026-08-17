import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ExchangeRates } from '../api';

export type Currency = 'USD' | 'RUB' | 'EUR';

const SYMBOLS: Record<Currency, string> = { USD: '$', RUB: '₽', EUR: '€' };
const STORAGE_KEY = 'girgich_currency';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  // Баланс, депозиты и списания всегда считаются в USD "под капотом" — это
  // только конвертация для отображения, чтобы не путать реальную сумму
  // платежа (она всегда в USDT) с валютой, в которой удобно смотреть цены.
  format: (usdAmount: number | null | undefined) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'USD',
  setCurrency: () => {},
  format: (v) => `$${(v ?? 0).toFixed(2)}`,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'RUB' || saved === 'EUR' ? saved : 'USD';
  });
  const [rates, setRates] = useState<ExchangeRates>({ RUB: 84.25, EUR: 0.87 });

  useEffect(() => {
    api.getExchangeRates().then(setRates).catch(console.error);
  }, []);

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }

  function format(usdAmount: number | null | undefined): string {
    if (usdAmount == null) return '—';
    const value = currency === 'USD' ? usdAmount : usdAmount * rates[currency];
    return `${SYMBOLS[currency]}${value.toFixed(2)}`;
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency, format }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
