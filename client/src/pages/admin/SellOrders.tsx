import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, SellOrder } from '../../api';

const STATUS_LABELS: Record<string, string> = {
  PENDING_TRANSFER: 'Ждём отправку',
  AWAITING_CONFIRMATION: 'Ждёт подтверждения',
  COMPLETED: 'Оплачено',
  REJECTED: 'Отклонено',
};

const ACTIVE_STATUSES = ['PENDING_TRANSFER', 'AWAITING_CONFIRMATION'];

export default function AdminSellOrders() {
  const [offers, setOffers] = useState<SellOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();

  function reload() {
    api
      .adminListSellOrders()
      .then(setOffers)
      .catch(() => navigate('/admin'));
  }

  useEffect(reload, [navigate]);

  async function confirm(id: string, action: 'received' | 'rejected') {
    setBusyId(id);
    try {
      await api.adminConfirmSellOrder(id, action);
      reload();
    } catch (err: any) {
      alert(err.message ?? 'Не удалось обновить заявку');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Заявки на выкуп скинов</h1>
      <table className="w-full text-sm">
        <thead className="text-neutral-400 text-left">
          <tr>
            <th className="py-2">Предмет</th>
            <th>Рыночная цена</th>
            <th>Выплата</th>
            <th>Статус</th>
            <th>Продавец</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id} className="border-t border-neutral-800">
              <td className="flex items-center gap-2 py-2">
                <img src={offer.iconUrl} className="w-8 h-8 object-contain" alt="" />
                {offer.name}
              </td>
              <td>${offer.marketPriceUsd.toFixed(2)}</td>
              <td className="text-emerald-400 font-medium">${offer.payoutUsd.toFixed(2)}</td>
              <td>
                <span
                  className={
                    offer.status === 'AWAITING_CONFIRMATION'
                      ? 'text-amber-400'
                      : offer.status === 'REJECTED'
                        ? 'text-red-400'
                        : offer.status === 'COMPLETED'
                          ? 'text-emerald-400'
                          : 'text-neutral-300'
                  }
                >
                  {STATUS_LABELS[offer.status] ?? offer.status}
                </span>
              </td>
              <td>
                {offer.user ? (
                  <a
                    href={`https://steamcommunity.com/profiles/${offer.user.steamId64}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-300 hover:text-emerald-400 underline"
                  >
                    {offer.user.personaName}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>
                {ACTIVE_STATUSES.includes(offer.status) && (
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === offer.id}
                      onClick={() => confirm(offer.id, 'received')}
                      className="text-xs px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
                    >
                      Получено — зачислить
                    </button>
                    <button
                      disabled={busyId === offer.id}
                      onClick={() => confirm(offer.id, 'rejected')}
                      className="text-xs px-2 py-1 rounded bg-red-900 hover:bg-red-800 disabled:opacity-50"
                    >
                      Отклонить
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
