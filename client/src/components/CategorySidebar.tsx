import type { CategoryCount } from '../api';
import { translate, useT } from '../i18n';
import { useLanguage, type Language } from '../context/LanguageContext';

// Человекочитаемые названия для категорий, которые Steam отдаёт в теге "Type".
// Категории, которых нет в словаре, показываются как есть (на английском).
export function categoryLabel(category: string, language: Language): string {
  const key = `category.${category}`;
  const translated = translate(language, key);
  return translated === key ? category : translated;
}

interface CategorySidebarProps {
  categories: CategoryCount[];
  active: string | null;
  onSelect: (category: string | null) => void;
  totalCount: number;
}

export default function CategorySidebar({ categories, active, onSelect, totalCount }: CategorySidebarProps) {
  const { language } = useLanguage();
  const t = useT();

  return (
    <nav className="w-full md:w-56 shrink-0">
      <div className="text-xs uppercase tracking-wide text-neutral-600 mb-2 px-1">{t('sidebar.categories')}</div>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelect(null)}
            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${
              active === null
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'text-neutral-300 hover:bg-white/5'
            }`}
          >
            <span>{t('sidebar.all')}</span>
            <span className="text-xs opacity-60">{totalCount}</span>
          </button>
        </li>
        {categories.map((c) => (
          <li key={c.category}>
            <button
              onClick={() => onSelect(c.category)}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                active === c.category
                  ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <span>{categoryLabel(c.category, language)}</span>
              <span className="text-xs opacity-60">{c.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
