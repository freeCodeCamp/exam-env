/**
 * Everything Sentry: client setup, what never reaches it, session replay, and the
 * rules for who reports what.
 *
 * Two rules the rest of the app relies on:
 *
 * 1. **One report per failure.** Errors raised in the Rust backend are captured
 *    there, where the span and the context live, so the frontend only displays
 *    them ({@link recordBackendError}). An upstream 5xx is retried, so it is
 *    reported once its retries are exhausted ({@link captureExhaustedApiError},
 *    wired into the query/mutation caches) rather than per attempt.
 * 2. **Titles must be stable across releases.** The bundle is minified with a new
 *    frame name every build, so anything grouped on the frame - or on a response
 *    body - fragments into a new issue per release. Reports here carry an
 *    explicit fingerprint instead.
 */

import {
  captureException,
  getReplay,
  init,
  replayIntegration,
  setUser,
} from "@sentry/react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "@tanstack/react-router";

import { LandingRoute } from "../pages/landing";
import { ApiError, isTransientApiError } from "./api-error";
import { backendEventId, getErrorMessage, isInformative } from "./errors";

// Non-actionable client conditions that should not be sent to Sentry:
// - "Provided token is revoked": the user's authorization token was revoked
//   server-side. Reported from several capture sites and, because the minified
//   bundle name changes every release, Sentry fragments it into a new issue per
//   build (see also the "do not capture client errors" guard in fetch.ts).
// - "failed to check for updates": FE-side capture of the same update-check
//   noise the backend filter already drops (backend/src/sentry_filter.rs).
// - devtools toggle rejection: users pressing the devtools shortcut in
//   production; the capability is deliberately denied (exam integrity), so the
//   rejection is expected.
// - "listeners[eventId].handlerId": upstream tauri bug - the Rust-injected
//   unlisten script does not guard against listener ids that are already gone
//   (stale after navigation, see tauri-apps/tauri#15583). Unlistening a dead
//   listener is a no-op; the thrown TypeError is harmless.
const DROP_MESSAGE_SIGNATURES = [
  "Provided token is revoked",
  "error sending request for url",
  "failed to check for updates",
  "internal_toggle_devtools not allowed",
  "listeners[eventId].handlerId",
];

/** Initialises the Sentry client. Call once, before the app renders. */
export function initSentry() {
  init({
    dsn: __SENTRY_DSN__,
    release: __APP_VERSION__,
    environment: __ENVIRONMENT__,
    // Performance tracing. browserTracingIntegration is on by default and
    // captures pageload/navigation; our custom spans (utils/fetch.ts) cover the
    // API/update calls. tracePropagationTargets links those spans to the
    // freeCodeCamp backend so a request can be followed FE -> BE.
    tracesSampleRate: 1.0,
    tracePropagationTargets: [__FREECODECAMP_API__],
    enableLogs: true,
    // Session Replay, errors-only: no proactive session sampling, but capture a
    // replay whenever an error is reported.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maxReplayDuration: 10_000,
      }),
    ],
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
}

/** Identifies the user on every subsequent event. Never the raw JWT - only the
 * inner token id, which is not a bearer credential. */
export function identifyUser(userId: string | null) {
  setUser(userId ? { id: userId } : null);
}

/**
 * Tells the backend which session replay is recording, so errors captured in the
 * backend link to the replay of the session that hit them.
 */
export async function reportReplayId() {
  const replayId = getReplay()?.getReplayId();
  await invoke("set_replay_id", { replayId: replayId ?? null });
}

/** Event id of the report an error already produced, keyed by the error itself. */
const REPORTED_EVENT_IDS = new WeakMap<object, string>();

/**
 * Reports an upstream 5xx once its retries are exhausted.
 *
 * Wired into the query and mutation caches (`main.tsx`), whose `onError` runs
 * after the last retry - unlike {@link captureApiResponseError}, which runs
 * inside the request and so reported the same outage up to three times.
 *
 * A no-op for anything else: non-5xx responses are reported by the request,
 * which knows which codes are expected.
 */
export function captureExhaustedApiError(error: unknown): string | undefined {
  if (!isTransientApiError(error)) return undefined;

  const reported = new Error(`upstream ${error.status} on ${error.endpoint}`);
  reported.name = "UpstreamError";

  const eventId = captureException(reported, {
    fingerprint: ["api-upstream-error", error.endpoint],
    tags: { endpoint: error.endpoint, http_status: String(error.status) },
    extra: {
      code: error.code,
      message: error.message,
      status: error.status,
    },
  });
  REPORTED_EVENT_IDS.set(error as ApiError, eventId);
  return eventId;
}

/** Id of the Sentry event already reported for `error`, if any. Lets a display
 * path show the id without capturing the failure a second time. */
export function reportedEventId(error: unknown): string | undefined {
  return typeof error === "object" && error !== null
    ? REPORTED_EVENT_IDS.get(error)
    : undefined;
}

/**
 * Reports an unexpected API response.
 *
 * `error` is optional so non-2xx responses without a parsed error body (e.g.
 * `getAttemptsByExamId`'s `status >= 300` guard) can also be reported.
 */
export function captureApiResponseError(res: {
  error?: { code: string; message: string };
  response: Response;
}) {
  // 5xx is retried, and this runs inside the query/mutation function - once per
  // attempt. `captureExhaustedApiError` reports it once, after the last retry.
  if (res.response.status >= 500) return;

  // An uninformative body ("{}", from an error the API did not recognise) would
  // title the issue after nothing at all - report it as unknown instead.
  if (res.error?.code && isInformative(res.error?.message)) {
    captureException(
      new Error(
        `${res.error.code}: ${res.error.message}; ${res.response.statusText}`,
      ),
    );
  } else {
    captureException(new Error(`Unknown error: ${JSON.stringify(res)}`));
  }
}

/**
 * Handles an error the backend returned.
 *
 * The backend captures its own errors, with the surrounding tracing span and the
 * context only it has (endpoint, status, version), so the frontend must not
 * report them again - a second `captureException` would mean two issues for one
 * failure, the frontend's being the less useful of the two.
 *
 * What the frontend does add is what the user was doing. Replay runs in buffer
 * mode (`replaysOnErrorSampleRate`), which only persists a recording when the
 * frontend itself captures an error, so flushing the buffer explicitly records
 * the session without producing an event of its own.
 */
export function recordBackendError(e: unknown) {
  console.error(e);

  void getReplay()
    ?.flush()
    // Re-reporting the replay id keeps subsequent backend errors linked: a flush
    // in buffer mode continues as a session replay under a possibly new id.
    .then(reportReplayId)
    .catch(() => {
      // Recording the session is best-effort; never mask the original error.
    });

  return { message: getErrorMessage(e), eventId: backendEventId(e) };
}

/** Reports a failure the frontend itself detected - i.e. one no other layer will
 * report. Backend errors and upstream 5xx have their own paths above. */
export function captureClientError(error: unknown, context?: string) {
  return captureException(error, context ? { tags: { context } } : undefined);
}

/** Reports an error the user cannot act on where they are, then sends them back
 * to the landing page with the event id to quote. */
export function captureAndNavigate(
  errorStr: string,
  navigate: ReturnType<typeof useNavigate>,
  /** Event id of an existing report for this failure. When set, the failure is
   * not captured again - the flash message quotes the id already reported (an
   * upstream 5xx is reported by the query cache once its retries run out). */
  alreadyReportedEventId?: string,
) {
  const error = new Error(
    errorStr || "Empty error message (source discarded the cause)",
  );
  const eventId = alreadyReportedEventId ?? captureException(error);
  navigate({
    to: LandingRoute.to,
    search: {
      flashKind: "error",
      flashMessage: `An error has occured. freeCodeCamp have been notified. Error ID: ${eventId}`,
    },
  });
  return error;
}
