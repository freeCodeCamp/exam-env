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

// Non-actionable client conditions that should not be sent to Sentry:
// - "Provided token is revoked": the user's authorization token was revoked
//   server-side. Reported from several capture sites and, because the minified
//   bundle name changes every release, Sentry fragments it into a new issue per
//   build (see also the "do not capture client errors" guard in utils/fetch.ts).
// - update-download failures: the updater plugin failing to fetch/download an
//   update asset is a transient network/server condition (offline, 403/redirect
//   on the asset, timeout), not a bug. The UI already surfaces a retry button.
const DROP_MESSAGE_SIGNATURES = [
  "Provided token is revoked",
  "error sending request for url",
  "Download request failed with status",
];

Sentry.init({
  dsn: __SENTRY_DSN__,
  release: __APP_VERSION__,
  environment: __ENVIRONMENT__,
  tracesSampleRate: 1.0,
  enableLogs: true,
  beforeSend(event) {
    const haystack = [
      event.message,
      ...(event.exception?.values?.map((v) => v.value) ?? []),
      // Raw objects captured via captureException (e.g. fetch.ts's
      // `captureException(res.error)`) are titled "Object captured as
      // exception…" with the real payload under extra.__serialized__, so the
      // matched text may only live here.
      event.extra ? JSON.stringify(event.extra) : undefined,
    ];
    if (
      haystack.some((m) =>
        DROP_MESSAGE_SIGNATURES.some((sig) => m?.includes(sig)),
      )
    ) {
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
