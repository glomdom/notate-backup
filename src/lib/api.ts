import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { refreshAuthToken, removeAuthTokens } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("auth");

  if (stored) {
    const tokens = JSON.parse(stored);

    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

const refreshAuthLogic = async (failedRequest: any) => {
  try {
    const newTokens = await refreshAuthToken();
    failedRequest.response.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;

    return Promise.resolve();
  } catch (error) {
    removeAuthTokens();

    window.location.href = "/login";

    return Promise.reject(error);
  }
};

createAuthRefreshInterceptor(api, refreshAuthLogic);

export default api;
