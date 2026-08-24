import { useEffect, useState } from 'react';
import { api, API_ORIGIN, SellableItem, SellOrder, PublicSellSettings } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useT } from '../i18n';

function SellConfirm({ offer, onDone }: { offer: SellOrder; onDone: () => void }) {
  const { format } = useCurrency();
  const t = useT();
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markSent() {
    setMarking(true);
    setError(null);
    try {
      await api.markSellOfferSent(offer.id);
      onDone();
    } catch (err: any) {
      setError(err.message ?? t('sell.error.generic'));
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-6 mb-8">
      <h2 className="text-sm font-semibold mb-4">{t('sell.confirmTitle')}</h2>
      <div className="rounded-lg bg-neutral-950 border border-white/10 px-3 py-2.5 text-sm break-all mb-4">
        {offer.receivingTradeUrl}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <img src={offer.iconUrl} className="w-12 h-12 object-contain" alt="" />
        <div>
          <div className="text-sm text-neutral-400">{t('sell.confirmName')}</div>
          <div className="font-medium">{offer.name}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm text-neutral-400">{t('sell.confirmPayout')}</div>
          <div className="text-xl font-bold text-emerald-400">{format(offer.payoutUsd)}</div>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mb-4">{t('sell.confirmWarning', { name: offer.name })}</p>
      <button
        onClick={markSent}
        disabled={marking}
        className="w-full rounded-lg py-3 font-semibold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 disabled:opacity-60"
      >
        {marking ? t('sell.markingSent') : t('sell.markSent')}
      </button>
      {error && <div className="text-sm text-red-400 mt-3">{error}</div>}
    </div>
  );
}

export default function Sell() {
  const { user, loading: authLoading } = useAuth();
  const { format } = useCurrency();
  const t = useT();

  const [settings, setSettings] = useState<PublicSellSettings | null>(null);
  const [items, setItems] = useState<SellableItem[] | null>(null);
  const [inventoryError, setInventoryError] = useState(false);
  const [sellingAssetId, setSellingAssetId] = useState<string | null>(null);
  const [pendingOffer, setPendingOffer] = useState<SellOrder | null>(null);
  const [myOffers, setMyOffers] = useState<SellOrder[]>([]);

  useEffect(() => {
    api.getSellSettings().then(setSettings).catch(console.error);
  }, []);

  function loadInventory() {
    if (!user) return;
    setItems(null);
    setInventoryError(false);
    api
      .getSellableInventory()
      .then(setItems)
      .catch(() => setInventoryError(true));
  }

  useEffect(loadInventory, [user]);

  useEffect(() => {
    if (user) api.mySellOffers().then(setMyOffers).catch(console.error);
  }, [user, pendingOffer]);

  async function sellItem(item: SellableItem) {
    setSellingAssetId(item.assetId);
    try {
      const offer = await api.createSellOffer({
        assetId: item.assetId,
        marketHashName: item.marketHashName,
        name: item.name,
        iconUrl: item.iconUrl,
        exterior: item.exterior,
      });
      setPendingOffer(offer);
      setItems((prev) => prev?.filter((i) => i.assetId !== item.assetId) ?? null);
    } catch (err: any) {
      alert(err.message ?? t('sell.error.generic'));
    } finally {
      setSellingAssetId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">{t('sell.title')}</h1>
      {settings && (
        <p className="text-sm text-neutral-400 mb-6">
          {t('sell.intro')} {t('sell.minPrice', { price: format(settings.minPriceUsd) })}
        </p>
      )}

      {pendingOffer && <SellConfirm offer={pendingOffer} onDone={() => setPendingOffer(null)} />}

      {authLoading ? (
        <div className="skeleton h-24 rounded-xl" />
      ) : !user ? (
        <a
          href={`${API_ORIGIN}/api/auth/steam`}
          className="inline-block rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold px-4 py-2.5 text-sm transition-all"
        >
          {t('sell.loginToSell')}
        </a>
      ) : inventoryError ? (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {t('sell.inventoryError')}
          <button onClick={loadInventory} className="ml-3 underline hover:text-red-200">
            {t('sell.retry')}
          </button>
        </div>
      ) : items === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton rounded-xl h-40" />
          ))}
        </div>
      ) : items.filter((i) => i.sellable).length === 0 ? (
        <div className="text-neutral-500 border border-dashed border-neutral-800 rounded-xl py-16 text-center">
          {t('sell.emptyInventory')}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {items
            .filter((i) => i.sellable)
            .map((item) => (
              <div
                key={item.assetId}
                className="rounded-xl border border-white/5 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 pt-5"
              >
                <div className="relative h-24 mb-3 flex items-center justify-center">
                  <img src={item.iconUrl} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="text-sm font-medium truncate text-neutral-100">{item.name}</div>
                {item.exterior && <div className="text-xs text-neutral-500 mt-0.5">{item.exterior}</div>}
                <div className="flex items-baseline justify-between mt-2 mb-3">
                  <span className="text-xs text-neutral-600">
                    {t('sell.marketPrice')}: {format(item.marketPriceUsd)}
                  </span>
                </div>
                <button
                  onClick={() => sellItem(item)}
                  disabled={sellingAssetId === item.assetId}
                  className="w-full rounded-lg py-2 text-sm font-semibold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 disabled:opacity-60"
                >
                  {t('sell.sellFor', { price: format(item.payoutUsd) })}
                </button>
              </div>
            ))}
        </div>
      )}

      {myOffers.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6">
          <h2 className="text-sm font-semibold mb-3">{t('sell.myOffers')}</h2>
          <div className="space-y-2">
            {myOffers.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between text-sm py-2 border-t border-white/5 first:border-t-0 text-neutral-400"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <img src={o.iconUrl} className="w-8 h-8 object-contain shrink-0" alt="" />
                  <span className="truncate">{o.name}</span>
                </span>
                <span className="shrink-0">{format(o.payoutUsd)}</span>
                <span className="shrink-0">{t(`sell.status.${o.status}`)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
