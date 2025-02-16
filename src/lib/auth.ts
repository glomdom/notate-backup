import axios from "axios";
import { jwtDecode } from 'jwt-decode';

export type AuthTokens = {
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
};

export interface JwtPayload {
  exp: number;
}

export function getExpiryFromToken(token: string): number {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    return decoded.exp;
  } catch (error) {
    console.error("Error decoding token:", error);

    return Date.now() / 1000 - 1;
  }
}

export function getAuthTokens(): AuthTokens | null {
  const stored = localStorage.getItem("auth");
  return stored ? JSON.parse(stored) : null;
}

export function setAuthTokens(tokens: AuthTokens) {
  localStorage.setItem("auth", JSON.stringify(tokens));
}

export function removeAuthTokens() {
  localStorage.removeItem("auth");
  localStorage.removeItem("user");
}

export async function refreshAuthToken(): Promise<AuthTokens> {
  const tokens = getAuthTokens();
  if (!tokens) throw new Error("No refresh token available");

  try {
    const response = await axios.post("/auth/refresh",
      { refreshToken: tokens.refreshToken }
    );
    const data = response.data;
    if (data.success) {
      const newTokens: AuthTokens = {
        accessToken: data.data.token,
        accessTokenExpiry: getExpiryFromToken(data.data.token),
        refreshToken: data.data.refreshToken.token,
      };
      setAuthTokens(newTokens);
      console.log("Token refreshed successfully", newTokens);
      return newTokens;
    } else {
      console.error("Refresh failed", data);
      removeAuthTokens();

      throw new Error("Token refresh failed");
    }
  } catch (err) {
    console.error("Error in refreshAuthToken:", err);
    removeAuthTokens();

    throw err;
  }
}

export async function performLogout(): Promise<void> {
  const tokens = getAuthTokens();
  if (tokens?.refreshToken) {
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/auth/logout", {
        refreshToken: tokens.refreshToken,
      });
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeAuthTokens();
    }
  }
}
