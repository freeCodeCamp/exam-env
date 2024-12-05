import { createContext, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { verifyToken } from "../utils/fetch";

export const AuthContext = createContext<{
  examEnvironmentAuthenticationToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [
    examEnvironmentAuthenticationToken,
    setExamEnvironmentAuthenticationToken,
  ] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await invoke<null | string>("get_authorization_token");
        // If token exists in key storage, try login
        if (token) {
          await login(token);
        }
      } catch (e) {
        setExamEnvironmentAuthenticationToken(null);
      }
    })();
  }, []);

  const login = async (token: string) => {
    const res = await verifyToken(token);
    // TODO: Add check that token will not expire soon
    //       If it will, tell user
    if (res.data) {
      setExamEnvironmentAuthenticationToken(token);
    } else {
      setExamEnvironmentAuthenticationToken(null);
      throw new Error(res.error.message);
    }
  };

  const logout = async () => {
    await invoke("remove_authorization_token");
    setExamEnvironmentAuthenticationToken(null);
  };

  const value = useMemo(
    () => ({
      examEnvironmentAuthenticationToken,
      login,
      logout,
    }),
    [examEnvironmentAuthenticationToken]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
