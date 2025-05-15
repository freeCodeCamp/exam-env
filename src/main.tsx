import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { ErrorRoute } from "./pages/error";
import { LandingRoute } from "./pages/landing";
import { ExamRoute } from "./pages/exam";
import { LoginRoute } from "./pages/login";
import { TestRoute } from "./pages/test";
import { SplashscreenRoute } from "./pages/splashscreen";
import { ExamLandingRoute } from "./pages/exam-landing";
import { rootRoute } from "./pages/root";
import { AuthProvider } from "./contexts/auth";

import "./index.css";
import "@freecodecamp/ui/dist/base.css";

if (import.meta.env.VITE_MOCK_DATA === "true" && import.meta.env.PROD) {
  throw new Error(
    "May not build application in production using VITE_MOCK_DATA flag"
  );
}

const queryClient = new QueryClient();

const routes = [
  SplashscreenRoute,
  ErrorRoute,
  LoginRoute,
  ExamRoute,
  LandingRoute,
  ExamLandingRoute,
  TestRoute,
];

const routeTree = rootRoute.addChildren(routes);

const router = createRouter({ routeTree, context: { queryClient } });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChakraProvider>
          <RouterProvider router={router} />
        </ChakraProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
