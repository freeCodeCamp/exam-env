import { createRootRoute, Outlet } from "@tanstack/react-router";
import React from "react";

const TanStackRouterDevtools =
  import.meta.env.NODE_ENV === "production"
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
    return (
      <>
        <TanStackRouterDevtools />
        <Outlet />
      </>
    );
  },
});
