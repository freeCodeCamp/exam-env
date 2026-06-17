import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

import "./index.css";
import "@freecodecamp/ui/dist/base.css";

// Expected, non-actionable client condition: the user's authorization token
// has been revoked server-side. It is reported from several capture sites and,
// because the minified bundle name changes every release, Sentry fragments it
// into a new issue per build. Drop it before sending (see also the "do not
// capture client errors" guard in utils/fetch.ts).
const REVOKED_TOKEN_MESSAGE = "Provided token is revoked";

Sentry.init({
  dsn: __SENTRY_DSN__,
  release: __APP_VERSION__,
  environment: __ENVIRONMENT__,
  tracesSampleRate: 1.0,
  enableLogs: true,
  beforeSend(event) {
    const messages = [
      event.message,
      ...(event.exception?.values?.map((v) => v.value) ?? []),
    ];
    if (messages.some((m) => m?.includes(REVOKED_TOKEN_MESSAGE))) {
      return null;
    }
    return event;
  },
});

const queryClient = new QueryClient();

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
  </React.StrictMode>
);
