import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Order } from '../api';

const STEPS = ['PAID', 'TRADE_SENT', 'COMPLETED'];
const LABELS: Record<string, string> = {
  PAID: 'Оплачено',
  TRADE_SENT: 'Трейд отправлен',
  COMPLETED: 'Завершено',
  FAILED: 'Ошибка',
};

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    const poll = () => api.getOrder(id).then(setOrder).catch(console.error);
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [id]);

  if (!order) return <div className="text-neutral-400">Загрузка...</div>;

  const currentIndex = STEPS.indexOf(order.status);
  const isTerminalFailure = order.status === 'FAILED';
  const isComplete = order.status === 'COMPLETED';
  const progressPct = currentIndex <= 0 ? 0 : (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
        ← На главную
      </Link>

      <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6 mt-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">Заказ #{order.id.slice(0, 8)}</h1>
          {isComplete && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-700 text-emerald-400 bg-emerald-500/10">
              Готово
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
          {order.item?.iconUrl && (
            <div className="w-16 h-16 rounded-lg bg-neutral-950 border border-white/5 flex items-center justify-center shrink-0">
              <img src={order.item.iconUrl} className="w-14 h-14 object-contain" alt={order.item.name} />
            </div>
          )}
          <div>
            <div className="font-medium">{order.item?.name}</div>
            <div className="text-neutral-400 text-sm">${order.priceUsd.toFixed(2)}</div>
          </div>
        </div>

        {isTerminalFailure ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-300 text-sm">
            {LABELS[order.status]}
            {order.failureReason ? `: ${order.failureReason}` : ''}. Средства автоматически возвращены на ваш баланс.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3.5 top-3.5 bottom-3.5 w-px bg-neutral-800" />
            <div
              className="absolute left-3.5 top-3.5 w-px bg-emerald-500 transition-all duration-500"
              style={{ height: `${progressPct}%` }}
            />
            <ol className="space-y-6 relative">
              {STEPS.map((step, i) => {
                const done = i < currentIndex || isComplete;
                const active = i === currentIndex && !isComplete;
                return (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className={`relative z-10 w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs border transition-colors ${
                        done || active
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-neutral-700 bg-neutral-950 text-neutral-600'
                      } ${active ? 'animate-pulse' : ''}`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span className={done || active ? 'text-neutral-100' : 'text-neutral-500'}>{LABELS[step]}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
