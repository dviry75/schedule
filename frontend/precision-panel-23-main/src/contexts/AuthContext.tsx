import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface AuthUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = "admin@system.com";
const ADMIN_PASSWORD = "Admin!23456";
const TOKEN_KEY = "chronos_token";
const USER_KEY = "chronos_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = !!user && !!localStorage.getItem(TOKEN_KEY);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const u = { email };
      localStorage.setItem(TOKEN_KEY, "fake_token_" + Date.now());
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setUser(u);
      return true;
    }
    
    // For demo: any valid-looking credentials work
    const u = { email };
    localStorage.setItem(TOKEN_KEY, "fake_token_" + Date.now());
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return true;
  }, []);

  const register = useCallback(async (email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const u = { email };
    localStorage.setItem(TOKEN_KEY, "fake_token_" + Date.now());
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
