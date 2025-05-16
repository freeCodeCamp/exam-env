import { createContext, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { verifyToken } from "../utils/fetch";

export const AuthContext = createContext<{
  accessToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await invoke<null | string>("get_access_token");
        // If token exists in key storage, try login
        if (token) {
          await login(token);
        }
      } catch (e) {
        setAccessToken(null);
      }
    })();
  }, []);

  const login = async (token: string) => {
    const res = await verifyToken(token);
    if (res.data) {
      setAccessToken(token);
    } else {
      setAccessToken(null);
      throw new Error(res.error.message);
    }
  };

  const logout = async () => {
    // TODO: Invalidate in Auth0
    await invoke("remove_access_token");
    setAccessToken(null);
  };

  const value = useMemo(
    () => ({
      accessToken,
      login,
      logout,
    }),
    [accessToken]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
