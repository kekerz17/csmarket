import { useEffect, useState } from 'react';
import { api, CategoryCount, Item } from '../api';
import ItemCard from '../components/ItemCard';
import Filters from '../components/Filters';
import CategorySidebar, { categoryLabel } from '../components/CategorySidebar';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .listItems({
          search: search || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          category: category ?? undefined,
        })
        .then(setItems)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, minPrice, maxPrice, category]);

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-white/5 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-8 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Скины CS2 напрямую от владельца</h1>
          <p className="text-neutral-400 max-w-xl text-sm sm:text-base">
            Мгновенная автоматическая выдача трейд-оффером, оплата в USDT.{' '}
            {totalCount > 0 && (
              <span className="text-neutral-300">
                Сейчас в продаже {totalCount} {totalCount === 1 ? 'предмет' : 'предметов'}.
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <CategorySidebar categories={categories} active={category} onSelect={setCategory} totalCount={totalCount} />

        <div className="flex-1 min-w-0">
          <Filters
            search={search}
            onSearchChange={setSearch}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />

          {category && (
            <div className="mb-4 text-sm text-neutral-400">
              Категория: <span className="text-neutral-200">{categoryLabel(category)}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton rounded-xl h-52" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-neutral-500 border border-dashed border-neutral-800 rounded-xl py-16 text-center">
              Нет предметов по заданным условиям.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
