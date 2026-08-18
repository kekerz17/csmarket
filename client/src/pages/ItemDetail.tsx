import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, API_ORIGIN, Item, User, getDiscountPercent, parseStickers } from '../api';
import { categoryLabel } from '../components/CategorySidebar';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useT } from '../i18n';

export default function ItemDetail() {
  const { assetId } = useParams<{ assetId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const t = useT();

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
        {t('item.backToAll')}
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
                {categoryLabel(item.category, language)}
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
                    <span className="text-amber-500" title={t('item.demoFloatTitle')}>
                      {' '}
                      {t('item.demoFloatLabel')}
                    </span>
                  )}
                </span>
              )}
            </div>
          )}

          {stickers.length > 0 && (
            <div className="mb-5">
              <div className="text-xs text-neutral-500 mb-2 uppercase tracking-wide">{t('item.stickers')}</div>
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
              <span className="text-3xl font-bold">{format(item.priceUsd)}</span>
              <span className="text-xs text-neutral-500">{t('item.payUsdt')}</span>
              {discount != null && (
                <>
                  <span className="text-sm text-neutral-600 line-through">{format(item.suggestedMarketPrice)}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {t('item.discountFromMarket', { pct: discount })}
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
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
                      setBuyError(err.message ?? t('buy.genericError'));
                    } finally {
                      setBuying(false);
                    }
                  }}
                />
              </div>
              <AddToCartButton item={item} />
            </div>
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
  const { format } = useCurrency();
  const t = useT();
  const baseClass =
    'w-full rounded-lg py-3 font-semibold transition-all shadow-lg disabled:cursor-not-allowed disabled:opacity-60';
  const buyClass = `${baseClass} bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 shadow-emerald-500/10`;
  const secondaryClass = `${baseClass} bg-neutral-800 hover:bg-neutral-700 text-neutral-100 shadow-none`;

  if (authLoading) {
    return <div className="skeleton h-12 rounded-lg" />;
  }

  if (!user) {
    return (
      <a href={`${API_ORIGIN}/api/auth/steam`} className={buyClass + ' block text-center'}>
        {t('buy.loginToBuy')}
      </a>
    );
  }

  if (!user.tradeUrl) {
    return (
      <a href="/profile" className={secondaryClass + ' block text-center'}>
        {t('buy.setTradeUrl')}
      </a>
    );
  }

  if (item.priceUsd != null && user.balanceUsd < item.priceUsd) {
    return (
      <a href="/profile" className={secondaryClass + ' block text-center'}>
        {t('buy.topUp')}
      </a>
    );
  }

  return (
    <button onClick={onBuy} disabled={buying} className={buyClass}>
      {buying ? t('buy.buying') : t('buy.buyFor', { price: format(item.priceUsd) })}
    </button>
  );
}

function AddToCartButton({ item }: { item: Item }) {
  const { addItem, isInCart } = useCart();
  const t = useT();
  const inCart = isInCart(item.assetId);

  return (
    <button
      onClick={() => !inCart && addItem(item)}
      disabled={inCart}
      title={inCart ? t('cart.inCart') : t('cart.addToCart')}
      className={`shrink-0 w-12 rounded-lg border flex items-center justify-center transition-colors ${
        inCart
          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
          : 'bg-neutral-800 border-transparent text-neutral-300 hover:bg-neutral-700'
      }`}
    >
      {inCart ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.694 2.602-7.174.135-.552-.283-1.076-.85-1.076H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      )}
    </button>
  );
}
