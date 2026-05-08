import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import React, { useEffect } from "react";
import { useColorMode } from "@chakra-ui/react";
import { getThemingClass } from "@freecodecamp/ui";

import { UnrecoverableError } from "../utils/types";
import { ErrorRoute } from "./error";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/react-router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      }))
    );

export const rootRoute = createRootRoute({
  component: () => {
    const navigate = useNavigate();
    const { colorMode } = useColorMode();

    // @freecodecamp/ui components read CSS variables (--foreground-primary,
    // --background-quaternary, etc.) defined under .light-palette / .dark-palette.
    // Mirror Chakra's color mode onto <body> so those variables resolve.
    useEffect(() => {
      const body = document.body;
      const next = getThemingClass(colorMode);
      body.classList.remove("light-palette", "dark-palette");
      body.classList.add(next);
      return () => body.classList.remove(next);
    }, [colorMode]);

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

      // Disable context menu
      const cm = import.meta.env.PROD
        ? (e: PointerEvent) => {
            e.preventDefault();
            return false;
          }
        : () => {};

      window.addEventListener("contextmenu", cm);

      return () => {
        unlisten.then((u) => u());
        window.removeEventListener("contextmenu", cm);
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
