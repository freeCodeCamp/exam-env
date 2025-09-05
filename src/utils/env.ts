export const LEARN_BASE =
  __ENVIRONMENT__ === "production"
    ? "https://freecodecamp.org"
    : __ENVIRONMENT__ === "staging"
    ? "https://freecodecamp.dev"
    : "http://localhost:8000";

export const VITE_MOCK_DATA = import.meta.env.VITE_MOCK_DATA === "true";
