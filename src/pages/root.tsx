import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import React, { useEffect } from "react";
import { UnrecoverableError } from "../utils/types";
import { ErrorRoute } from "./error";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      }))
    );

export const rootRoute = createRootRoute({
  component: () => {
    const navigate = useNavigate();

    useEffect(() => {
      const unlisten = listen<UnrecoverableError>(
        "unrecoverable-error",
        (error) => {
          navigate({
            to: ErrorRoute.to,
            search: { errorInfo: error.payload.message },
          });
        }
      );

      return () => {
        unlisten.then((u) => u());
      };
    }, []);

    return (
      <>
        <TanStackRouterDevtools />
        <Outlet />
      </>
    );
  },
});
