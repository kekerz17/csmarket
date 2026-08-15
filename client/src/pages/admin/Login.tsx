import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.adminLogin(password);
      navigate('/admin/dashboard');
    } catch {
      setError('Неверный пароль');
    }
  }

  return (
    <div className="max-w-xs mx-auto mt-12">
      <form onSubmit={submit} className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6 space-y-4">
        <h1 className="text-lg font-semibold text-center mb-2">Вход в админку</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          autoFocus
          className="w-full rounded-lg bg-neutral-950 border border-white/10 px-3 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-colors"
        />
        {error && <div className="text-sm text-red-400 text-center">{error}</div>}
        <button className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-2.5 font-semibold text-neutral-950 transition-all">
          Войти
        </button>
      </form>
    </div>
  );
}
