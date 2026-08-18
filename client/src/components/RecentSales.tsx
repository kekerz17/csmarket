import { useEffect, useState } from 'react';
import { api, exteriorCode, type RecentSale } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import { useT } from '../i18n';

const POLL_INTERVAL_MS = 60_000;

export default function RecentSales() {
  const [data, setData] = useState<{ total: number; sales: RecentSale[] } | null>(null);
  const { format } = useCurrency();
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    function load() {
      api
        .getRecentSales()
        .then((res) => {
          if (!cancelled) setData(res);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!data || data.sales.length === 0) return null;

  return (
    <section className="border-t border-white/5 mt-12 pt-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
            <svg
              className="w-4 h-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {t('recentSales.title')}
          </h2>
          <div className="text-sm text-neutral-500">
            {t('recentSales.totalSold')} <span className="text-emerald-400 font-semibold">{data.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
          {data.sales.map((sale) => {
            const rarity = sale.rarityColor ? `#${sale.rarityColor}` : '#3f3f46';
            const code = exteriorCode(sale.exterior);
            return (
              <div
                key={sale.id}
                style={{ ['--rarity' as string]: rarity }}
                className="relative shrink-0 w-40 rounded-xl border border-white/5 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 overflow-hidden"
              >
                <span
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${rarity}, transparent)` }}
                />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-emerald-400">{format(sale.priceUsd)}</span>
                  {code && <span className="text-[10px] text-neutral-500">{code}</span>}
                </div>
                <div className="relative h-16 flex items-center justify-center mb-2">
                  <span
                    className="absolute inset-0 rounded-full blur-2xl opacity-20"
                    style={{ background: rarity }}
                  />
                  <img src={sale.iconUrl} alt={sale.name} className="relative w-full h-full object-contain" />
                </div>
                <div className="text-xs text-neutral-300 truncate" title={sale.name}>
                  {sale.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
