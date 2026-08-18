import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, API_ORIGIN } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useT } from '../i18n';

export default function Cart() {
  const { items, removeItem, total, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { format } = useCurrency();
  const t = useT();

  const [checkingOut, setCheckingOut] = useState(false);
  const [failures, setFailures] = useState<{ name: string; reason: string }[]>([]);
  const [done, setDone] = useState(false);

  async function checkout() {
    setCheckingOut(true);
    setFailures([]);
    setDone(false);

    const failed: { name: string; reason: string }[] = [];
    for (const item of items) {
      try {
        await api.purchase(item.assetId);
        removeItem(item.assetId);
      } catch (err: any) {
        failed.push({ name: item.name, reason: err.message ?? t('buy.genericError') });
      }
    }

    setFailures(failed);
    setCheckingOut(false);
    setDone(true);
    if (failed.length === 0) clear();
  }

  if (items.length === 0 && !done) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-neutral-500 mb-4">{t('cart.empty')}</div>
        <Link
          to="/"
          className="inline-block rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-sm font-medium transition-colors"
        >
          {t('cart.browse')}
        </Link>
      </div>
    );
  }

  const buyClass =
    'w-full rounded-lg py-3 font-semibold transition-all shadow-lg disabled:cursor-not-allowed disabled:opacity-60 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 shadow-emerald-500/10';
  const secondaryClass =
    'w-full rounded-lg py-3 font-semibold transition-all shadow-lg disabled:cursor-not-allowed disabled:opacity-60 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 shadow-none block text-center';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{t('cart.title')}</h1>

      {done && failures.length === 0 && (
        <div className="mb-4 rounded-lg border border-emerald-800 bg-emerald-950/30 p-4 text-emerald-300 text-sm">
          {t('cart.allDone')} <Link to="/profile" className="underline">{t('header.profile')}</Link>
        </div>
      )}
      {done && failures.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-300 text-sm space-y-1">
          <div>{t('cart.someFailed')}</div>
          {failures.map((f, i) => (
            <div key={i} className="text-red-400">
              {t('cart.itemFailed', { name: f.name, reason: f.reason })}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="space-y-2 mb-6">
            {items.map((item) => (
              <div
                key={item.assetId}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-neutral-900/60 p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={item.iconUrl} className="w-12 h-12 object-contain shrink-0" alt="" />
                  <div className="min-w-0">
                    <div className="text-sm truncate">{item.name}</div>
                    {item.exterior && <div className="text-xs text-neutral-500">{item.exterior}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold">{format(item.priceUsd)}</span>
                  <button
                    onClick={() => removeItem(item.assetId)}
                    className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    {t('cart.remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/5 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-400">{t('cart.total')}</span>
              <span className="text-2xl font-bold">{format(total)}</span>
            </div>

            {authLoading ? (
              <div className="skeleton h-12 rounded-lg" />
            ) : !user ? (
              <a href={`${API_ORIGIN}/api/auth/steam`} className={secondaryClass}>
                {t('header.login')}
              </a>
            ) : !user.tradeUrl ? (
              <Link to="/profile" className={secondaryClass}>
                {t('buy.setTradeUrl')}
              </Link>
            ) : user.balanceUsd < total ? (
              <Link to="/profile" className={secondaryClass}>
                {t('buy.topUp')}
              </Link>
            ) : (
              <button onClick={checkout} disabled={checkingOut} className={buyClass}>
                {checkingOut ? t('cart.checkingOut') : t('cart.checkout', { price: format(total) })}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
