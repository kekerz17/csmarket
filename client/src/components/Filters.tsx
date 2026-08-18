import { useT } from '../i18n';

interface FiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
}

const inputClass =
  'rounded-lg bg-neutral-900 border border-white/10 px-3 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-colors';

export default function Filters({
  search,
  onSearchChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: FiltersProps) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('filters.search')}
          className={`${inputClass} w-full pl-9`}
        />
      </div>
      <input
        value={minPrice}
        onChange={(e) => onMinPriceChange(e.target.value)}
        placeholder={t('filters.minPrice')}
        type="number"
        className={`${inputClass} w-28`}
      />
      <input
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        placeholder={t('filters.maxPrice')}
        type="number"
        className={`${inputClass} w-28`}
      />
    </div>
  );
}
