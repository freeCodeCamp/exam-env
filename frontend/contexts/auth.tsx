import { useCallback, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useMutation, useQuery } from "@tanstack/react-query";

import { verifyToken } from "../utils/fetch";
import { setUser } from "@sentry/react";
import { AuthContext } from ".";
import { logUsage } from "../utils/telemetry";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Memoize queryFn to prevent infinite re-fetching
  const tokenQueryFn = useCallback(async () => {
    const token = await invoke<null | string>("get_authorization_token");
    if (token) {
      try {
        await verifyToken(token);
      } catch (e) {
        console.error(e);
        logUsage("auth.token_verify", { result: "invalid" });
        return null;
      }
      setUser({ id: token });
      logUsage("auth.token_verify", { result: "valid" });
      return token;
    }
    logUsage("auth.token_verify", { result: "absent" });
    return null;
  }, []);

  const token = useQuery({
    queryKey: ["authorizationToken"],
    queryFn: tokenQueryFn,
    // staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutation to set token in platform storage
  const login = useMutation({
    mutationFn: async (newToken: string) => {
      await verifyToken(newToken);
      await invoke("set_authorization_token", {
        newAuthorizationToken: newToken,
      });
    },
    onSuccess() {
      logUsage("auth.login_success");
      // Invalidate and refetch the token query to update context
      token.refetch();
    },
    onError(error) {
      console.error("Failed to verify and store token:", error);
      logUsage("auth.login_failure");
      token.refetch();
    },
    retry: false,
  });

  // Mutation to remove token from platform storage
  const logout = useMutation({
    mutationFn: async () => {
      await invoke("remove_authorization_token");
    },
    onSuccess() {
      logUsage("auth.logout");
      setUser(null);
      // Invalidate and refetch the token query to update context
      token.refetch();
    },
    onError(error) {
      console.error("Failed to remove token:", error);
      token.refetch();
    },
    retry: false,
  });

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
