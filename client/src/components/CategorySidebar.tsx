import type { CategoryCount } from '../api';

// Человекочитаемые названия для категорий, которые Steam отдаёт в теге "Type".
// Категории, которых нет в этой карте, показываются как есть (на английском).
const CATEGORY_LABELS: Record<string, string> = {
  Rifle: 'Винтовки',
  'Sniper Rifle': 'Снайперские винтовки',
  Pistol: 'Пистолеты',
  SMG: 'Пистолеты-пулемёты',
  Shotgun: 'Дробовики',
  Machinegun: 'Пулемёты',
  Knife: 'Ножи',
  Gloves: 'Перчатки',
  Sticker: 'Стикеры',
  Container: 'Кейсы',
  Agent: 'Агенты',
  Collectible: 'Коллекционные',
  Graffiti: 'Граффити',
  'Music Kit': 'Наборы музыки',
  Patch: 'Патчи',
  Key: 'Ключи',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

interface CategorySidebarProps {
  categories: CategoryCount[];
  active: string | null;
  onSelect: (category: string | null) => void;
  totalCount: number;
}

export default function CategorySidebar({ categories, active, onSelect, totalCount }: CategorySidebarProps) {
  return (
    <nav className="w-full md:w-56 shrink-0">
      <div className="text-xs uppercase tracking-wide text-neutral-600 mb-2 px-1">Категории</div>
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
            <span>Все категории</span>
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
              <span>{categoryLabel(c.category)}</span>
              <span className="text-xs opacity-60">{c.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
