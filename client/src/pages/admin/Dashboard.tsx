import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Item, BotStatus, ExchangeRates, getDiscountPercent, parseStickers } from '../../api';

function ExchangeRateSettings() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.adminGetExchangeRates().then(setRates).catch(console.error);
  }, []);

  async function save() {
    if (!rates) return;
    setSaved(false);
    await api.adminSetExchangeRates(rates);
    setSaved(true);
  }

  if (!rates) return null;

  return (
    <div className="rounded-xl border border-white/5 bg-neutral-900/60 p-4 mb-6 flex items-center gap-4 text-sm">
      <span className="text-neutral-400">Курс (за 1 USD):</span>
      <label className="flex items-center gap-1.5">
        ₽
        <input
          type="number"
          step="0.01"
          value={rates.RUB}
          onChange={(e) => {
            setSaved(false);
            setRates({ ...rates, RUB: Number(e.target.value) });
          }}
          className="w-20 rounded bg-neutral-950 border border-neutral-800 px-2 py-1"
        />
      </label>
      <label className="flex items-center gap-1.5">
        €
        <input
          type="number"
          step="0.01"
          value={rates.EUR}
          onChange={(e) => {
            setSaved(false);
            setRates({ ...rates, EUR: Number(e.target.value) });
          }}
          className="w-20 rounded bg-neutral-950 border border-neutral-800 px-2 py-1"
        />
      </label>
      <button onClick={save} className="text-xs px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700">
        Сохранить
      </button>
      {saved && <span className="text-emerald-400 text-xs">Сохранено</span>}
    </div>
  );
}

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
    try {
      await api.adminSuggestPrice(id);
    } catch (err: any) {
      alert(err.message ?? 'Не удалось получить рыночную цену');
    }
    reload();
  }

  const [refreshingAll, setRefreshingAll] = useState(false);

  async function refreshAllPrices() {
    setRefreshingAll(true);
    try {
      const result = await api.adminRefreshAllPrices();
      alert(`Обновлено цен: ${result.updated} из ${result.total}`);
    } catch (err: any) {
      alert(err.message ?? 'Не удалось обновить цены');
    } finally {
      setRefreshingAll(false);
    }
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
          <button
            onClick={refreshAllPrices}
            disabled={refreshingAll}
            className="text-xs px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
          >
            {refreshingAll ? 'Обновляем...' : 'Обновить все рыночные цены'}
          </button>
          <Link to="/admin/orders" className="text-sm text-neutral-400 hover:text-neutral-200">
            Заказы →
          </Link>
        </div>
      </div>

      <ExchangeRateSettings />

      <table className="w-full text-sm">
        <thead className="text-neutral-400 text-left">
          <tr>
            <th className="py-2">Предмет</th>
            <th>Аккаунт</th>
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
              <td>
                <a
                  href={`https://steamcommunity.com/profiles/${item.ownerSteamId64}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-500 hover:text-neutral-300 underline text-xs"
                >
                  {item.ownerSteamId64}
                </a>
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
