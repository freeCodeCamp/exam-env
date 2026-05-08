import { createContext } from "react";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

export const AuthContext = createContext<{
  token: UseQueryResult<null | string, unknown>;
  login: UseMutationResult<void, unknown, string, unknown>;
  logout: UseMutationResult<void, unknown, void, unknown>;
} | null>(null);
