import axios from "axios";
import { refreshAuthToken, performLogout } from "./auth";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
});

// Attach access token to every request.
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const tokens = JSON.parse(stored);
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // If the error is not 401 or the request is already a refresh or logout, just reject.
    if (
      !response ||
      response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If refresh is already in progress, queue the request.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const newTokens = await refreshAuthToken();
      isRefreshing = false;
      onRefreshed(newTokens.accessToken);
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      await performLogout();
      window.location.href = "/login"; // Force full redirect to clear state
      return Promise.reject(refreshError);
    }
  }
);

export default api;
