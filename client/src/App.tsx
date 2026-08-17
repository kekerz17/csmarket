import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import Profile from './pages/Profile';
import OrderStatus from './pages/OrderStatus';
import DepositStatus from './pages/DepositStatus';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import { useAuth } from './context/AuthContext';
import { api, API_ORIGIN } from './api';

function HeaderAuth() {
  const { user, loading, refresh } = useAuth();

  if (loading) return <div className="w-24 h-8 skeleton rounded-full" />;

  if (!user) {
    return (
      <a
        href={`${API_ORIGIN}/api/auth/steam`}
        className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold transition-all"
      >
        Войти через Steam
      </a>
    );
  }

  async function logout() {
    await api.logout().catch(() => {});
    refresh();
  }

  return (
    <div className="flex items-center gap-2.5">
      <Link to="/profile" className="flex items-center gap-2.5 group">
        <span className="text-sm text-emerald-400 font-semibold">${user.balanceUsd.toFixed(2)}</span>
        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-md border border-white/10 group-hover:border-white/30 transition-colors" />
        <span className="hidden sm:inline text-sm text-neutral-300 group-hover:text-white transition-colors max-w-[120px] truncate">
          {user.personaName}
        </span>
      </Link>
      <button
        onClick={logout}
        title="Выйти из аккаунта"
        className="text-neutral-600 hover:text-red-400 transition-colors text-sm"
      >
        ⏻
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-neutral-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-neutral-950 font-black text-sm shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              G
            </span>
            <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
              Girgich Store
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/admin" className="hidden sm:inline text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              Админ
            </Link>
            <HeaderAuth />
          </div>
        </div>
      </header>

      <main className="px-6 py-8 max-w-6xl mx-auto w-full flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:assetId" element={<ItemDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order/:id" element={<OrderStatus />} />
          <Route path="/deposit/:id" element={<DepositStatus />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </main>

      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Girgich Store — предметы из личного инвентаря Steam</span>
          <span>Выдача автоматическая, трейд-холд зависит от настроек вашего аккаунта Steam</span>
        </div>
      </footer>
    </div>
  );
}
