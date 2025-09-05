import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import prism from "vite-plugin-prismjs";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // @ts-expect-error
  const env = loadEnv(mode, process.cwd(), "");

  assertEnvVars(env);

  return {
    envDir: "./",
    plugins: [
      react(),
      prism({
        languages: "all",
        plugins: ["line-numbers"],
        theme: "default",
        css: true,
      }),
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version),
      __SENTRY_DSN__: JSON.stringify(env.SENTRY_DSN),
      __FREECODECAMP_API__: JSON.stringify(env.FREECODECAMP_API),
      __ENVIRONMENT__: JSON.stringify(env.ENVIRONMENT),
    },
  };
});

function assertEnvVars(env: ReturnType<typeof loadEnv>) {
  if (!env.npm_package_version) {
    throw new Error("`npm_package_version` env var not found.");
  }

  const allowedEnvironments = ["development", "staging", "production"];
  if (!allowedEnvironments.includes(env.ENVIRONMENT)) {
    throw new Error(
      `ENVIRONMENT env var must be one of [${allowedEnvironments.join(
        ","
      )}], found ${env.ENVIRONMENT}.`
    );
  }

  if (env.VITE_MOCK_DATA !== "true") {
    const allowedAPIs = [
      "http://localhost:3000",
      "https://api.freecodecamp.dev",
      "https://api.freecodecamp.org",
    ];
    if (!allowedAPIs.includes(env.FREECODECAMP_API)) {
      throw new Error(
        `VITE_MOCK_DATA=${
          env.VITE_MOCK_DATA
        }; FREECODECAMP_API must be one of [${allowedAPIs.join(",")}], found ${
          env.FREECODECAMP_API
        }`
      );
    }
  }

  if (env.ENVIRONMENT !== "development") {
    if (!env.SENTRY_DSN) {
      throw new Error(
        `ENVIRONMENT=${env.ENVIRONMENT}; SENTRY_DSN must be set.`
      );
    }

    if (env.VITE_MOCK_DATA === "true") {
      throw new Error(
        `ENVIRONMENT=${env.ENVIRONMENT}; VITE_MOCK_DATA may not be ${env.VITE_MOCK_DATA}.`
      );
    }
  }
}
