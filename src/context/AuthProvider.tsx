"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { refreshAuthToken, performLogout } from "@/lib/auth";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type AuthTokens = {
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthTokens>;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAuth = localStorage.getItem("auth");
      const storedUser = localStorage.getItem("user");

      if (storedAuth && storedUser) {
        try {
          const parsedAuth = JSON.parse(storedAuth) as AuthTokens;
          // Use a small buffer (10 seconds) to avoid premature expiry.
          const buffer = 10;
          const currentTime = Date.now() / 1000;
          if (parsedAuth.accessTokenExpiry > currentTime + buffer) {
            setAuthTokens(parsedAuth);
            setUser(JSON.parse(storedUser));
          } else {
            // Token expired or nearly expired: attempt refresh.
            await refreshToken();
          }
        } catch (error) {
          console.error("Error during auth initialization:", error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const responseData = response.data;
      if (responseData.success) {
        const data = responseData.data;
        const newTokens: AuthTokens = {
          accessToken: data.token,
          accessTokenExpiry: Date.now() / 1000 + 900, // 15 minutes
          refreshToken: data.refreshToken.token,
        };

        localStorage.setItem("auth", JSON.stringify(newTokens));
        localStorage.setItem("user", JSON.stringify(data.user));

        setAuthTokens(newTokens);
        setUser(data.user);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await performLogout();
    } finally {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      setAuthTokens(null);
      setUser(null);
      router.push("/login");
    }
  };

  const refreshToken = async (): Promise<AuthTokens> => {
    try {
      const newTokens = await refreshAuthToken();
      setAuthTokens(newTokens);
      return newTokens;
    } catch (error) {
      await logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
