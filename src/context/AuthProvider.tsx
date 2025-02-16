"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshAuthToken, performLogout } from "@/lib/auth";
import Cookies from "js-cookie";
import api from "@/lib/api";

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
      const storedAuth = Cookies.get("auth");
      const storedUser = Cookies.get("user");

      if (storedAuth && storedUser) {
        try {
          const parsedAuth = JSON.parse(storedAuth) as AuthTokens;
          const parsedUser = JSON.parse(storedUser);
          const currentTime = Date.now() / 1000;
          const buffer = 10; // 10 seconds buffer

          if (parsedAuth.accessTokenExpiry > currentTime + buffer) {
            setAuthTokens(parsedAuth);
            setUser(parsedUser);
          } else {
            await refreshToken();
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          await logout();
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

        Cookies.set("auth", JSON.stringify(newTokens), {
          expires: 1 / 96, // 15 minutes expressed in days
          secure: true,
          sameSite: "strict",
        });

        Cookies.set("user", JSON.stringify(data.user), {
          expires: 1 / 96,
          secure: true,
          sameSite: "strict",
        });

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
      Cookies.remove("auth");
      Cookies.remove("user");

      setAuthTokens(null);
      setUser(null);

      router.push("/login");
    }
  };

  const refreshToken = async (): Promise<AuthTokens> => {
    try {
      const newTokens = await refreshAuthToken();

      setAuthTokens(newTokens);

      Cookies.set("auth", JSON.stringify(newTokens), {
        expires: 1 / 96,
        secure: true,
        sameSite: "strict",
      });

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
