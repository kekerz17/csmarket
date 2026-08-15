import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Order } from '../../api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .adminListOrders()
      .then(setOrders)
      .catch(() => navigate('/admin'));
  }, [navigate]);

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
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-neutral-800">
              <td className="py-2">{order.id.slice(0, 8)}</td>
              <td>{order.item?.name}</td>
              <td>${order.priceUsd.toFixed(2)}</td>
              <td>{order.status}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
