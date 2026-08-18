import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import Profile from './pages/Profile';
import OrderStatus from './pages/OrderStatus';
import DepositStatus from './pages/DepositStatus';
import Faq from './pages/Faq';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import { useAuth } from './context/AuthContext';
import { useCurrency, type Currency } from './context/CurrencyContext';
import { useLanguage, type Language } from './context/LanguageContext';
import { useT } from './i18n';
import { api, API_ORIGIN, clearUserToken } from './api';
import { useOnlineCount } from './useOnlineCount';
import { pluralRu } from './pluralRu';

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="bg-transparent text-neutral-400 hover:text-neutral-200 text-sm border border-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 cursor-pointer"
    >
      <option className="bg-neutral-900" value="ru">
        RU
      </option>
      <option className="bg-neutral-900" value="en">
        EN
      </option>
    </select>
  );
}

function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className="bg-transparent text-neutral-400 hover:text-neutral-200 text-sm border border-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 cursor-pointer"
    >
      <option className="bg-neutral-900" value="USD">
        $ USD
      </option>
      <option className="bg-neutral-900" value="RUB">
        ₽ RUB
      </option>
      <option className="bg-neutral-900" value="EUR">
        € EUR
      </option>
    </select>
  );
}

function HeaderAuth() {
  const { user, loading, refresh } = useAuth();
  const { format } = useCurrency();
  const t = useT();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (loading) return <div className="w-24 h-8 skeleton rounded-full" />;

  if (!user) {
    return (
      <a
        href={`${API_ORIGIN}/api/auth/steam`}
        className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold transition-all"
      >
        {t('header.login')}
      </a>
    );
  }

  async function logout() {
    setOpen(false);
    await api.logout().catch(() => {});
    clearUserToken();
    refresh();
    navigate('/');
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2.5 group">
        <span className="text-sm text-emerald-400 font-semibold">{format(user.balanceUsd)}</span>
        <img
          src={user.avatarUrl}
          alt=""
          className={`w-8 h-8 rounded-md border transition-colors ${open ? 'border-white/40' : 'border-white/10 group-hover:border-white/30'}`}
        />
        <span className="hidden sm:inline text-sm text-neutral-300 group-hover:text-white transition-colors max-w-[120px] truncate">
          {user.personaName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-neutral-900 shadow-xl shadow-black/40 overflow-hidden py-1 text-sm">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            {t('header.profile')}
          </Link>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/40 transition-colors"
          >
            {t('header.logout')}
          </button>
        </div>
      )}
    </div>
  );
}

function OnlineCount() {
  const online = useOnlineCount();
  const { language } = useLanguage();

  if (online == null) return null;

  return (
    <span className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {language === 'ru'
        ? `${online} ${pluralRu(online, 'пользователь', 'пользователя', 'пользователей')} онлайн`
        : `${online} online`}
    </span>
  );
}

export default function App() {
  const t = useT();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-neutral-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="group">
            <span className="inline-block px-3.5 py-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 text-neutral-950 font-black text-lg tracking-tight shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              Girgich Store
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <CurrencySelector />
            <Link to="/admin" className="hidden sm:inline text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              {t('header.admin')}
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
          <Route path="/faq" element={<Faq />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </main>

      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{t('footer.tagline')}</span>
          <OnlineCount />
          <span>{t('footer.holdNote')}</span>
          <div className="flex items-center gap-4 shrink-0">
            <a href="mailto:lev2009177@gmail.com" className="text-neutral-400 hover:text-emerald-400 transition-colors">
              lev2009177@gmail.com
            </a>
            <Link to="/faq" className="text-neutral-400 hover:text-emerald-400 transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
