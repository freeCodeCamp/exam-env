import React from "react";
import ReactDOM from "react-dom/client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import "prismjs/themes/prism-okaidia.min.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

import { ErrorRoute } from "./pages/error";
import { LandingRoute } from "./pages/landing";
import { ExamRoute } from "./pages/exam";
import { LoginRoute } from "./pages/login";
import { SplashscreenRoute } from "./pages/splashscreen";
import { ExamLandingRoute } from "./pages/exam-landing";
import { rootRoute } from "./pages/root";
import { AuthProvider } from "./contexts/auth";
import { theme } from "./theme";
import { logUsage } from "./utils/telemetry";
import {
  captureExhaustedApiError,
  initSentry,
  reportReplayId,
} from "./utils/sentry";

import "./index.css";
import "@freecodecamp/ui/dist/base.css";

initSentry();

logUsage("app.launched", {
  version: __APP_VERSION__,
  environment: __ENVIRONMENT__,
});

// Errors raised in the backend are captured there, so the backend needs this
// session's replay id to link its issues to the recording. Reported again after
// each flush in `recordBackendError`, which is also what covers the case of the
// replay not having started yet at this point.
void reportReplayId();

// Cache-level `onError` runs once a query or mutation has finished failing, i.e.
// after its retries are exhausted - the only place an upstream 5xx can be
// reported exactly once. Anything inside a query function runs per
// attempt instead.
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => captureExhaustedApiError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => captureExhaustedApiError(error),
  }),
});

const routes = [
  SplashscreenRoute,
  ErrorRoute,
  LoginRoute,
  ExamRoute,
  LandingRoute,
  ExamLandingRoute,
];

const routeTree = rootRoute.addChildren(routes);

const router = createRouter({ routeTree, context: { queryClient } });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <RouterProvider router={router} />
        </ChakraProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
