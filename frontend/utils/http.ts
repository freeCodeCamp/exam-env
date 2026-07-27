import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

// Requests run in the Rust process via reqwest, so the WebView document origin
// is not attached. Force a stable Origin the freeCodeCamp API can validate.
export const EXAM_ENV_ORIGIN = "https://exam-env.freecodecamp.org";

type Init = Parameters<typeof tauriFetch>[1];

export function httpFetch(input: URL | Request | string, init?: Init) {
  // Merge existing headers (auth token on Request, apikey on init) then set
  // Origin. Passing init.headers alone would replace a Request's headers.
  const headers = new Headers();
  if (input instanceof Request)
    input.headers.forEach((v, k) => headers.set(k, v));
  if (init?.headers)
    new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  headers.set("Origin", EXAM_ENV_ORIGIN);
  return tauriFetch(input, { ...init, headers });
}
