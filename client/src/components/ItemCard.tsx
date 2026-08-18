import { Link } from 'react-router-dom';
import type { Item } from '../api';
import { getDiscountPercent, parseStickers } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import { useT } from '../i18n';

export default function ItemCard({ item }: { item: Item }) {
  const { format } = useCurrency();
  const t = useT();
  const rarity = item.rarityColor ? `#${item.rarityColor}` : '#3f3f46';
  const stickerCount = parseStickers(item).length;
  const discount = getDiscountPercent(item);

  return (
    <Link
      to={`/item/${item.assetId}`}
      style={{ ['--rarity' as string]: rarity }}
      className="group relative block rounded-xl border border-white/5 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 pt-5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--rarity)]/60 hover:shadow-[0_8px_24px_-8px_var(--rarity)]"
    >
      <span
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, transparent, ${rarity}, transparent)` }}
      />

      <div className="relative h-32 mb-3 flex items-center justify-center">
        <span
          className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity"
          style={{ background: rarity }}
        />
        <img
          src={item.iconUrl}
          alt={item.name}
          className="relative w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-200"
        />
        {stickerCount > 0 && (
          <span className="absolute top-0 right-0 text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800/90 border border-white/10 text-neutral-300">
            +{stickerCount}
          </span>
        )}
        {discount != null && (
          <span className="absolute top-0 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30">
            -{discount}%
          </span>
        )}
      </div>

      <div className="text-sm font-medium truncate text-neutral-100">{item.name}</div>
      {item.exterior && (
        <div className="text-xs text-neutral-500 mt-0.5">
          {item.exterior}
          {item.floatValue != null && (
            <span>
              {' '}
              · {item.floatValue.toFixed(4)}
              {item.floatSource === 'simulated' && (
                <span className="text-amber-500" title={t('item.demoFloatTitleShort')}>
                  {' '}
                  {t('item.demoFloatShort')}
                </span>
              )}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-base font-semibold text-neutral-50">{format(item.priceUsd)}</span>
          {discount != null && (
            <span className="text-xs text-neutral-600 line-through">{format(item.suggestedMarketPrice)}</span>
          )}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
          style={{ borderColor: `${rarity}80`, color: rarity }}
        >
          {t('item.cryptoBadge')}
        </span>
      </div>
    </Link>
  );
}
