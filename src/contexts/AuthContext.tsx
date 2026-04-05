import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser, getCurrentUser, login as doLogin, logout as doLogout } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [loading] = useState(false);

  const login = async (email: string, password: string): Promise<AuthUser | null> => {
    const result = doLogin(email, password);
    if (result) {
      setUser(result);
      return result;
    }
    return null;
  };

  const logout = () => {
    doLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
