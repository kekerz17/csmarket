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
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    consumeTokenFromUrl();
    refresh();
  }, []);

  return <AuthContext.Provider value={{ user, loading, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
