import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Deposit } from '../api';
import { useAuth } from '../context/AuthContext';

const LABELS: Record<string, string> = {
  PENDING: 'Ожидание оплаты',
  COMPLETED: 'Зачислено на баланс',
  FAILED: 'Оплата не прошла',
  EXPIRED: 'Счёт истёк',
};

export default function DepositStatus() {
  const { id } = useParams<{ id: string }>();
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const { refresh } = useAuth();

  useEffect(() => {
    if (!id) return;
    const poll = () =>
      api
        .getDeposit(id)
        .then((d) => {
          setDeposit(d);
          if (d.status === 'COMPLETED') refresh();
        })
        .catch(console.error);
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [id]);

  if (!deposit) return <div className="text-neutral-400">Загрузка...</div>;

  const isDone = deposit.status === 'COMPLETED';
  const isFailed = deposit.status === 'FAILED' || deposit.status === 'EXPIRED';

  return (
    <div className="max-w-md mx-auto">
      <Link to="/profile" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
        ← В профиль
      </Link>

      <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6 mt-4 text-center">
        <div className="text-3xl font-bold mb-1">${deposit.amountUsd.toFixed(2)}</div>
        <div className="text-xs text-neutral-500 mb-6">пополнение баланса в USDT</div>

        {isDone ? (
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/30 p-4 text-emerald-300 text-sm">
            ✓ {LABELS[deposit.status]}
          </div>
        ) : isFailed ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-300 text-sm">
            {LABELS[deposit.status]}
          </div>
        ) : (
          <div className="rounded-lg border border-amber-900/60 bg-amber-950/30 p-4 text-amber-300 text-sm animate-pulse">
            {LABELS[deposit.status]}...
          </div>
        )}
      </div>
    </div>
  );
}
