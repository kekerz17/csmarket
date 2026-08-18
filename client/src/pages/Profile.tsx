import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Order } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useT } from '../i18n';

const inputClass =
  'w-full rounded-lg bg-neutral-950 border border-white/10 px-3 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-colors';

export default function Profile() {
  const { user, loading, refresh } = useAuth();
  const { format, currency } = useCurrency();
  const t = useT();
  const navigate = useNavigate();

  const [tradeUrl, setTradeUrl] = useState('');
  const [tradeUrlSaved, setTradeUrlSaved] = useState(false);
  const [tradeUrlError, setTradeUrlError] = useState<string | null>(null);

  const [depositAmount, setDepositAmount] = useState('10');
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) setTradeUrl(user.tradeUrl ?? '');
  }, [user]);

  useEffect(() => {
    api.myOrders().then(setOrders).catch(console.error);
  }, [user]);

  if (!loading && !user) {
    navigate('/');
    return null;
  }
  if (!user) return <div className="text-neutral-400">{t('profile.loading')}</div>;

  async function logout() {
    await api.logout().catch(() => {});
    refresh();
    navigate('/');
  }

  async function saveTradeUrl(e: FormEvent) {
    e.preventDefault();
    setTradeUrlError(null);
    setTradeUrlSaved(false);
    try {
      await api.updateTradeUrl(tradeUrl);
      setTradeUrlSaved(true);
      refresh();
    } catch (err: any) {
      setTradeUrlError(err.message ?? t('profile.saveError'));
    }
  }

  async function submitDeposit(e: FormEvent) {
    e.preventDefault();
    setDepositError(null);
    setDepositLoading(true);
    try {
      const amount = Number(depositAmount);
      const { depositId, invoiceUrl, dryRun } = await api.createDeposit(amount);
      if (dryRun) {
        navigate(`/deposit/${depositId}`);
      } else {
        window.location.href = invoiceUrl;
      }
    } catch (err: any) {
      setDepositError(err.message ?? t('profile.depositError'));
    } finally {
      setDepositLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-xl border border-white/10" />
          <div>
            <h1 className="text-xl font-semibold">{user.personaName}</h1>
            <div className="text-sm text-neutral-500">{t('profile.steamId', { id: user.steamId64 })}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-red-400 hover:border-red-900 transition-colors"
        >
          {t('profile.logout')}
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">{t('profile.balance')}</div>
            <div className="text-3xl font-bold text-emerald-400">{format(user.balanceUsd)}</div>
          </div>
        </div>
        <form onSubmit={submitDeposit} className="flex gap-2 items-center">
          <input
            type="number"
            min={1}
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className={`${inputClass} w-32`}
          />
          <button
            type="submit"
            disabled={depositLoading}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-all"
          >
            {depositLoading ? t('profile.creatingInvoice') : t('profile.depositButton')}
          </button>
        </form>
        <p className="text-xs text-neutral-600 mt-2">
          {t('profile.depositNote')}
          {currency !== 'USD' && Number(depositAmount) > 0 && <> ≈ {format(Number(depositAmount))}</>}
        </p>
        {depositError && <div className="text-sm text-red-400 mt-2">{depositError}</div>}
      </div>

      <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6">
        <h2 className="text-sm font-semibold mb-1">{t('profile.tradeUrlTitle')}</h2>
        <p className="text-xs text-neutral-500 mb-3">{t('profile.tradeUrlDesc')}</p>
        <div className="mb-4 text-sm text-amber-400 bg-amber-950/30 border border-amber-900/60 rounded-lg p-3 flex gap-2">
          <span>⚠</span>
          <span>{t('profile.tradeHoldWarning')}</span>
        </div>
        <form onSubmit={saveTradeUrl} className="flex gap-2">
          <input
            required
            value={tradeUrl}
            onChange={(e) => setTradeUrl(e.target.value)}
            placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
            className={inputClass}
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {t('profile.save')}
          </button>
        </form>
        {tradeUrlSaved && <div className="text-sm text-emerald-400 mt-2">{t('profile.saved')}</div>}
        {tradeUrlError && <div className="text-sm text-red-400 mt-2">{tradeUrlError}</div>}
      </div>

      {orders.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6">
          <h2 className="text-sm font-semibold mb-3">{t('profile.myOrders')}</h2>
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => navigate(`/order/${o.id}`)}
                className="flex items-center justify-between text-sm py-2 border-t border-white/5 first:border-t-0 cursor-pointer hover:text-neutral-100 text-neutral-400"
              >
                <span className="flex items-center gap-2">
                  <img src={o.item.iconUrl} className="w-8 h-8 object-contain" alt="" />
                  {o.item.name}
                </span>
                <span>{format(o.priceUsd)}</span>
                <span>{t(`order.status.${o.status}`)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
