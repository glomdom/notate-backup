"use client";

import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";

export default function ClientAuthCheck() {
  const { refreshToken } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = localStorage.getItem("auth");
      if (auth) {
        try {
          await refreshToken();
        } catch (error) {
          localStorage.removeItem("auth");
        }
      }
    };
    checkAuth();
  }, [refreshToken]);

  return null;
}
