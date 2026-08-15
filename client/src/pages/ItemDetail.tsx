import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, Item, User, getDiscountPercent, parseStickers } from '../api';
import { categoryLabel } from '../components/CategorySidebar';
import { useAuth } from '../context/AuthContext';

export default function ItemDetail() {
  const { assetId } = useParams<{ assetId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!assetId) return;
    setItem(null);
    api.getItem(assetId).then(setItem).catch(console.error);
  }, [assetId]);

  if (!item) {
    return (
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="space-y-3">
          <div className="skeleton h-6 w-2/3 rounded" />
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-10 w-1/2 rounded mt-6" />
        </div>
      </div>
    );
  }

  const stickers = parseStickers(item);
  const rarity = item.rarityColor ? `#${item.rarityColor}` : '#3f3f46';
  const discount = getDiscountPercent(item);

  return (
    <div>
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
        ← Ко всем предметам
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mt-4">
        <div
          className="relative rounded-2xl border border-white/5 bg-gradient-to-b from-neutral-900 to-neutral-950 flex items-center justify-center p-10 min-h-[280px]"
          style={{ ['--rarity' as string]: rarity }}
        >
          <span className="absolute inset-0 rounded-2xl blur-3xl opacity-20" style={{ background: rarity }} />
          <img
            src={item.iconUrl}
            alt={item.name}
            className="relative w-full max-w-sm object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {item.category && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-neutral-400">
                {categoryLabel(item.category)}
              </span>
            )}
            {item.rarity && (
              <span
                className="text-xs px-2.5 py-1 rounded-full border font-medium"
                style={{ borderColor: `${rarity}80`, color: rarity, background: `${rarity}14` }}
              >
                {item.rarity}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-semibold mb-1 leading-tight">{item.name}</h1>

          {item.exterior && (
            <div className="text-neutral-400 mb-4">
              {item.exterior}
              {item.floatValue != null && (
                <span>
                  {' '}
                  · float {item.floatValue.toFixed(6)}
                  {item.floatSource === 'simulated' && (
                    <span
                      className="text-amber-500"
                      title="Демо-значение: бот ещё не подключен, реальный float не запрошен у Steam"
                    >
                      {' '}
                      (демо, не реальные данные)
                    </span>
                  )}
                </span>
              )}
            </div>
          )}

          {stickers.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-neutral-500 mb-2 uppercase tracking-wide">Наклейки</div>
              <div className="flex gap-2 flex-wrap">
                {stickers.map((s) => (
                  <img
                    key={s.slot}
                    src={s.iconUrl}
                    title={s.name}
                    alt={s.name}
                    className="w-11 h-11 object-contain rounded-lg border border-white/10 bg-neutral-900 p-1.5 hover:border-white/30 transition-colors"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/5 bg-neutral-900/60 p-5 mt-6">
            <div className="flex items-baseline gap-2 mb-4 flex-wrap">
              <span className="text-3xl font-bold">${item.priceUsd?.toFixed(2)}</span>
              <span className="text-xs text-neutral-500">в USDT</span>
              {discount != null && (
                <>
                  <span className="text-sm text-neutral-600 line-through">${item.suggestedMarketPrice!.toFixed(2)}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    -{discount}% от рынка
                  </span>
                </>
              )}
            </div>
            <BuyButton
              item={item}
              user={user}
              authLoading={authLoading}
              buying={buying}
              onBuy={async () => {
                setBuyError(null);
                setBuying(true);
                try {
                  const { orderId } = await api.purchase(item.assetId);
                  navigate(`/order/${orderId}`);
                } catch (err: any) {
                  setBuyError(err.message ?? 'Не удалось купить предмет');
                } finally {
                  setBuying(false);
                }
              }}
            />
            {buyError && <div className="text-sm text-red-400 mt-3">{buyError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function BuyButton({
  item,
  user,
  authLoading,
  buying,
  onBuy,
}: {
  item: Item;
  user: User | null;
  authLoading: boolean;
  buying: boolean;
  onBuy: () => void;
}) {
  const baseClass =
    'w-full rounded-lg py-3 font-semibold transition-all shadow-lg disabled:cursor-not-allowed disabled:opacity-60';
  const buyClass = `${baseClass} bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 shadow-emerald-500/10`;
  const secondaryClass = `${baseClass} bg-neutral-800 hover:bg-neutral-700 text-neutral-100 shadow-none`;

  if (authLoading) {
    return <div className="skeleton h-12 rounded-lg" />;
  }

  if (!user) {
    return (
      <a href="/api/auth/steam" className={buyClass + ' block text-center'}>
        Войти через Steam, чтобы купить
      </a>
    );
  }

  if (!user.tradeUrl) {
    return (
      <a href="/profile" className={secondaryClass + ' block text-center'}>
        Укажите trade-ссылку в профиле
      </a>
    );
  }

  if (item.priceUsd != null && user.balanceUsd < item.priceUsd) {
    return (
      <a href="/profile" className={secondaryClass + ' block text-center'}>
        Недостаточно баланса — пополнить
      </a>
    );
  }

  return (
    <button onClick={onBuy} disabled={buying} className={buyClass}>
      {buying ? 'Покупаем...' : `Купить за $${item.priceUsd?.toFixed(2)}`}
    </button>
  );
}
