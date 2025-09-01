export const VITE_FREECODECAMP_API = import.meta.env.VITE_FREECODECAMP_API;

export const ENVIRONMENT = VITE_FREECODECAMP_API.endsWith(".org")
  ? "production"
  : VITE_FREECODECAMP_API.endsWith(".dev")
  ? "staging"
  : "local";

export const LEARN_BASE =
  ENVIRONMENT === "production"
    ? "https://freecodecamp.org"
    : ENVIRONMENT === "staging"
    ? "https://freecodecamp.dev"
    : "http://localhost:8000";

export const VITE_MOCK_DATA = import.meta.env.VITE_MOCK_DATA === "true";
