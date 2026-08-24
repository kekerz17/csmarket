import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setUserToken, User } from '../api';

// После логина через Steam бэкенд редиректит на /profile#token=... — этот
// фрагмент никогда не уходит на сервер, поэтому забираем токен здесь, на
// клиенте, и убираем его из адресной строки (чтобы не остался в истории).
function consumeTokenFromUrl() {
  const hash = window.location.hash;
  const match = hash.match(/token=([^&]+)/);
  if (!match) return;
  setUserToken(decodeURIComponent(match[1]));
  const cleanHash = hash.replace(/#?token=[^&]+&?/, '');
  const url = new URL(window.location.href);
  url.hash = cleanHash;
  window.history.replaceState(null, '', url.toString());
}

const REF_STORAGE_KEY = 'pending_ref_code';

// Реферальную ссылку (?ref=код) может открыть кто угодно, ещё не войдя в
// аккаунт — код нужно запомнить и применить уже после входа через Steam
// (сам OpenID-редирект на steamcommunity.com и обратно не сохраняет query-
// параметры фронтенда, поэтому localStorage — самый простой надёжный способ
// пронести код через весь цикл логина).
function captureReferralFromUrl() {
  const url = new URL(window.location.href);
  const ref = url.searchParams.get('ref');
  if (!ref) return;
  localStorage.setItem(REF_STORAGE_KEY, ref);
  url.searchParams.delete('ref');
  window.history.replaceState(null, '', url.toString());
}

function applyPendingReferral() {
  const code = localStorage.getItem(REF_STORAGE_KEY);
  if (!code) return;
  localStorage.removeItem(REF_STORAGE_KEY);
  api.applyReferral(code).catch(() => {});
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, refresh: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    api
      .me()
      .then((u) => {
        setUser(u);
        applyPendingReferral();
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    captureReferralFromUrl();
    consumeTokenFromUrl();
    refresh();
  }, []);

  return <AuthContext.Provider value={{ user, loading, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
