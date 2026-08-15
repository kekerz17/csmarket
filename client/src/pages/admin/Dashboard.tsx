import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Item, BotStatus, getDiscountPercent, parseStickers } from '../../api';

export default function AdminDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [bot, setBot] = useState<BotStatus | null>(null);
  const navigate = useNavigate();

  function reload() {
    api
      .adminListItems()
      .then(setItems)
      .catch(() => navigate('/admin'));
    api.adminBotStatus().then(setBot).catch(console.error);
  }

  useEffect(reload, []);

  async function updatePrice(id: string, priceUsd: number) {
    await api.adminUpdateItem(id, { priceUsd });
    reload();
  }

  async function toggleListed(id: string, listed: boolean) {
    await api.adminUpdateItem(id, { listed });
    reload();
  }

  async function suggestPrice(id: string) {
    await api.adminSuggestPrice(id);
    reload();
  }

  async function refreshFloat(id: string) {
    try {
      await api.adminRefreshFloat(id);
    } catch (err: any) {
      alert(err.message ?? 'Не удалось получить float');
    }
    reload();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Инвентарь</h1>
        <div className="flex items-center gap-4">
          <span
            className={`text-xs px-2 py-1 rounded-full border ${
              bot?.online ? 'border-emerald-700 text-emerald-400' : 'border-neutral-700 text-neutral-400'
            }`}
          >
            Бот: {bot?.dryRun ? 'не настроен — ручная выдача' : bot?.online ? 'онлайн' : 'офлайн'}
          </span>
          <Link to="/admin/orders" className="text-sm text-neutral-400 hover:text-neutral-200">
            Заказы →
          </Link>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-neutral-400 text-left">
          <tr>
            <th className="py-2">Предмет</th>
            <th>Статус</th>
            <th>Float</th>
            <th>Наклейки</th>
            <th>Цена, $</th>
            <th>Рыночная цена</th>
            <th>В продаже</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-neutral-800">
              <td className="py-2 flex items-center gap-2">
                <img src={item.iconUrl} className="w-8 h-8 object-contain" alt="" />
                {item.name}
              </td>
              <td className="text-neutral-400">{item.status}</td>
              <td>
                {item.exterior ? (
                  <>
                    {item.floatValue != null ? item.floatValue.toFixed(6) : '—'}
                    {item.floatValue != null && item.floatSource === 'simulated' && (
                      <span className="text-amber-500 text-xs" title="DRY RUN — бот не подключен, значение сгенерировано, не реальное">
                        {' '}
                        демо
                      </span>
                    )}
                    <button
                      onClick={() => refreshFloat(item.id)}
                      className="ml-2 text-xs text-neutral-500 hover:text-neutral-300 underline"
                    >
                      обновить
                    </button>
                  </>
                ) : (
                  <span className="text-neutral-600">н/д</span>
                )}
              </td>
              <td>
                <div className="flex gap-1">
                  {parseStickers(item).map((s) => (
                    <img key={s.slot} src={s.iconUrl} title={s.name} alt={s.name} className="w-6 h-6 object-contain" />
                  ))}
                  {parseStickers(item).length === 0 && <span className="text-neutral-600">—</span>}
                </div>
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={item.priceUsd ?? ''}
                  onBlur={(e) => e.target.value && updatePrice(item.id, Number(e.target.value))}
                  className="w-20 rounded bg-neutral-900 border border-neutral-800 px-2 py-1"
                />
                {getDiscountPercent(item) != null && (
                  <span className="ml-1 text-xs font-medium text-rose-400">-{getDiscountPercent(item)}%</span>
                )}
              </td>
              <td>
                {item.suggestedMarketPrice ? `$${item.suggestedMarketPrice.toFixed(2)}` : '—'}
                <button
                  onClick={() => suggestPrice(item.id)}
                  className="ml-2 text-xs text-neutral-500 hover:text-neutral-300 underline"
                >
                  обновить
                </button>
              </td>
              <td>
                <input type="checkbox" checked={item.listed} onChange={(e) => toggleListed(item.id, e.target.checked)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
