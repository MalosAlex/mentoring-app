"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getStoredToken,
  getUserFromToken,
  login as authLogin,
  logout as authLogout,
  registerUser as authRegister,
  User,
} from "@/lib/auth-service";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: typeof authLogin;
  logout: () => Promise<void>;
  register: typeof authRegister;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const stored = getStoredToken();
      if (stored) {
        const userData = getUserFromToken(stored.token);
        setUser(userData);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login: typeof authLogin = async (identifier, password) => {
    const result = await authLogin(identifier, password);
    if (result.success && result.token) {
      const userData = getUserFromToken(result.token);
      setUser(userData);
    }
    return result;
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  const register: typeof authRegister = async (payload) => {
    return authRegister(payload);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
