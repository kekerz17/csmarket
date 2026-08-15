import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, User } from '../api';

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

  useEffect(refresh, []);

  return <AuthContext.Provider value={{ user, loading, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
