import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import Profile from './pages/Profile';
import OrderStatus from './pages/OrderStatus';
import DepositStatus from './pages/DepositStatus';
import Faq from './pages/Faq';
import Privacy from './pages/Privacy';
import Cart from './pages/Cart';
import Sell from './pages/Sell';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminSellOrders from './pages/admin/SellOrders';
import { useAuth } from './context/AuthContext';
import { useCurrency, type Currency } from './context/CurrencyContext';
import { useLanguage, type Language } from './context/LanguageContext';
import { useCart } from './context/CartContext';
import { useT } from './i18n';
import { api, API_ORIGIN, clearUserToken } from './api';
import { useOnlineCount } from './useOnlineCount';
import { pluralRu } from './pluralRu';
import RecentSales from './components/RecentSales';

function FlagRu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className}>
      <rect width="3" height="2" fill="#fff" />
      <rect width="3" height="1.3333" y="0.6667" fill="#0039A6" />
      <rect width="3" height="0.6667" y="1.3333" fill="#D52B1E" />
    </svg>
  );
}

function FlagUs({ className }: { className?: string }) {
  const stripeH = 10 / 13;
  return (
    <svg viewBox="0 0 19 10" className={className}>
      <rect width="19" height="10" fill="#fff" />
      {Array.from({ length: 13 }, (_, i) =>
        i % 2 === 0 ? <rect key={i} x="0" y={i * stripeH} width="19" height={stripeH} fill="#B22234" /> : null,
      )}
      <rect width="7.6" height={stripeH * 7} fill="#3C3B6E" />
    </svg>
  );
}

const LANGUAGES: { code: Language; label: string; Flag: (props: { className?: string }) => JSX.Element }[] = [
  { code: 'ru', label: 'RU', Flag: FlagRu },
  { code: 'en', label: 'EN', Flag: FlagUs },
];

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 text-sm border border-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 cursor-pointer transition-colors"
      >
        <current.Flag className="w-4 h-3 rounded-[2px] overflow-hidden shrink-0" />
        {current.label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-24 rounded-lg border border-white/10 bg-neutral-900 shadow-xl shadow-black/40 overflow-hidden py-1 text-sm z-20">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                l.code === language ? 'text-emerald-400' : 'text-neutral-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <l.Flag className="w-4 h-3 rounded-[2px] overflow-hidden shrink-0" />
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
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

function CartLink() {
  const { items } = useCart();
  return (
    <Link to="/cart" className="relative flex items-center text-neutral-400 hover:text-neutral-200 transition-colors">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.694 2.602-7.174.135-.552-.283-1.076-.85-1.076H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {items.length > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-neutral-950 text-[10px] font-bold flex items-center justify-center">
          {items.length}
        </span>
      )}
    </Link>
  );
}

function BuySellToggle() {
  const location = useLocation();
  const t = useT();
  const sellActive = location.pathname.startsWith('/sell');

  const baseClass = 'px-4 py-1.5 text-sm font-semibold transition-colors';
  const activeClass = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950';
  const inactiveClass = 'text-neutral-400 hover:text-neutral-200';

  return (
    <div className="hidden sm:flex items-center rounded-lg border border-white/10 overflow-hidden">
      <Link to="/" className={`${baseClass} ${sellActive ? inactiveClass : activeClass}`}>
        {t('header.buy')}
      </Link>
      <Link to="/sell" className={`${baseClass} ${sellActive ? activeClass : inactiveClass}`}>
        {t('header.sell')}
      </Link>
    </div>
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
            <BuySellToggle />
            <LanguageSelector />
            <CurrencySelector />
            <CartLink />
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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/sell-orders" element={<AdminSellOrders />} />
        </Routes>
      </main>

      <RecentSales />

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
            <Link to="/privacy" className="text-neutral-400 hover:text-emerald-400 transition-colors">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-6 text-[11px] text-neutral-700 text-center sm:text-left">
          Powered by Steam. Not affiliated with Valve Corp.
        </div>
      </footer>
    </div>
  );
}
