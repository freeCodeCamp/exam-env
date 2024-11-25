import { Navigate } from "@tanstack/react-router";
import { AuthContext } from "../contexts/auth";
import { ReactNode, useContext } from "react";
import { LoginRoute } from "../pages/login";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  // Safety: Context should exist, because provider is mounted at root.
  const { examEnvironmentAuthenticationToken } = useContext(AuthContext)!;
  if (!examEnvironmentAuthenticationToken) {
    // user is not authenticated
    console.debug("User not authenticated. Navigating to login page.");
    return <Navigate to={LoginRoute.to} />;
  }
  return children;
};
