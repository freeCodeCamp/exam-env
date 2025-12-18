import { createContext, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";

import { verifyToken } from "../utils/fetch";
import { setUser } from "@sentry/react";

export const AuthContext = createContext<{
  token: UseQueryResult<null | string, unknown>;
  login: UseMutationResult<void, unknown, string, unknown>;
  logout: UseMutationResult<void, unknown, void, unknown>;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const checkTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      await verifyToken(token);
    },
    retry: false,
  });
  // Query to read token from the platform key storage (IPC)
  const token = useQuery({
    queryKey: ["authorizationToken"],
    queryFn: async () => {
      console.debug("Fetching authorization token from storage");
      const token = await invoke<null | string>("get_authorization_token");
      console.debug("Fetched authorization token:", token);
      if (token) {
        await checkTokenMutation.mutateAsync(token);
        setUser({ id: token });
      }
      return token ?? null;
    },
    staleTime: Infinity,
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
      // Invalidate and refetch the token query to update context
      token.refetch();
    },
    onError(error) {
      console.error("Failed to verify and store token:", error);
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
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
