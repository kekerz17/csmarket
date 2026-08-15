import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Order } from '../../api';

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Оплачено',
  AWAITING_MANUAL_FULFILLMENT: 'Ждёт ручной отправки',
  TRADE_SENT: 'Трейд отправлен',
  COMPLETED: 'Завершено',
  FAILED: 'Ошибка',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();

  function reload() {
    api
      .adminListOrders()
      .then(setOrders)
      .catch(() => navigate('/admin'));
  }

  useEffect(reload, [navigate]);

  async function fulfill(id: string, action: 'sent' | 'completed' | 'failed') {
    setBusyId(id);
    try {
      await api.adminFulfillOrder(id, action);
      reload();
    } catch (err: any) {
      alert(err.message ?? 'Не удалось обновить заказ');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Заказы</h1>
      <table className="w-full text-sm">
        <thead className="text-neutral-400 text-left">
          <tr>
            <th className="py-2">ID</th>
            <th>Предмет</th>
            <th>Цена</th>
            <th>Статус</th>
            <th>Покупатель</th>
            <th>Trade URL</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-neutral-800">
              <td className="py-2">{order.id.slice(0, 8)}</td>
              <td className="flex items-center gap-2 py-2">
                {order.item?.iconUrl && <img src={order.item.iconUrl} className="w-8 h-8 object-contain" alt="" />}
                {order.item?.name}
              </td>
              <td>${order.priceUsd.toFixed(2)}</td>
              <td>
                <span
                  className={
                    order.status === 'AWAITING_MANUAL_FULFILLMENT'
                      ? 'text-amber-400'
                      : order.status === 'FAILED'
                        ? 'text-red-400'
                        : order.status === 'COMPLETED'
                          ? 'text-emerald-400'
                          : 'text-neutral-300'
                  }
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </td>
              <td>
                {order.user ? (
                  <a
                    href={`https://steamcommunity.com/profiles/${order.user.steamId64}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-300 hover:text-emerald-400 underline"
                  >
                    {order.user.personaName}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td className="max-w-[220px] truncate">
                {order.user?.tradeUrl ? (
                  <a
                    href={order.user.tradeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-500 hover:text-neutral-300 underline"
                  >
                    {order.user.tradeUrl}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>
                {(order.status === 'AWAITING_MANUAL_FULFILLMENT' || order.status === 'TRADE_SENT') && (
                  <div className="flex gap-2">
                    {order.status === 'AWAITING_MANUAL_FULFILLMENT' && (
                      <button
                        disabled={busyId === order.id}
                        onClick={() => fulfill(order.id, 'sent')}
                        className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
                      >
                        Отправлено
                      </button>
                    )}
                    <button
                      disabled={busyId === order.id}
                      onClick={() => fulfill(order.id, 'completed')}
                      className="text-xs px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
                    >
                      Завершено
                    </button>
                    <button
                      disabled={busyId === order.id}
                      onClick={() => fulfill(order.id, 'failed')}
                      className="text-xs px-2 py-1 rounded bg-red-900 hover:bg-red-800 disabled:opacity-50"
                    >
                      Ошибка/возврат
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
