import { captureException, getReplay } from "@sentry/react";
import { useNavigate } from "@tanstack/react-router";
import { LandingRoute } from "../pages/landing";
import { reportReplayId } from "./commands";

export type Result<T> =
  | { error: null; data: T }
  | { error: FCCError; data: null };

export type FCCError = {
  debug: string;
  kind: "Credential" | "FS" | "Serialization" | "Request" | "Client";
  user: string;
  /** Set when the backend reported the error to Sentry. */
  eventId?: string | null;
};

export function isFCCError(e: unknown): e is FCCError {
  if (typeof e !== "object" || e === null) {
    return false;
  }

  if (!("kind" in e)) {
    return false;
  }

  if (!("debug" in e) || !("user" in e)) {
    return false;
  }

  if (
    e.kind !== "Credential" &&
    e.kind !== "FS" &&
    e.kind !== "Serialization" &&
    e.kind !== "Request" &&
    e.kind !== "Client"
  ) {
    return false;
  }
  return true;
}

export function getErrorMessage(e: unknown): string {
  console.error(e);
  if (isFCCError(e)) {
    return e.user;
  }
  if (e instanceof Error) {
    return e.message;
  }
  if (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as Record<string, unknown>).message === "string"
  ) {
    return (e as Record<string, unknown>).message as string;
  }
  return "An unexpected error occurred: " + JSON.stringify(e);
}

/**
 * Asserts the given value is not null or undefined.
 *
 * @param value - The value to assert.
 */
export function assertError(value: unknown): asserts value is FCCError {
  if (value === null || value === undefined) {
    throw new Error("Unreachable. Value should not be null or undefined.");
  }

  if (
    typeof value !== "object" ||
    (!("FSError" in value) && !("SerializationError" in value))
  ) {
    throw new Error("Invalid error object " + JSON.stringify(value));
  }
}

export interface ErrorResponse<T> {
  error: T;
  response: { status: number; statusText: string; url: string };
}

export type QueryFn<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export type QueryFnError<F extends (...args: any) => any> = NonNullable<
  Awaited<ReturnType<F>>["error"]
> & {
  _status: Awaited<ReturnType<F>>["response"]["status"];
};

export function err<T extends ErrorResponse<any>>(res: T) {
  return { ...res.error, _status: res.response.status };
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

/** Id of the Sentry event the backend reported this error as, for the user to
 * quote to support. */
export function backendEventId(e: unknown): string | undefined {
  return isFCCError(e) ? (e.eventId ?? undefined) : undefined;
}

export function captureAndNavigate(
  errorStr: string,
  navigate: ReturnType<typeof useNavigate>,
) {
  const error = new Error(
    errorStr || "Empty error message (source discarded the cause)",
  );
  const eventId = captureException(error);
  navigate({
    to: LandingRoute.to,
    search: {
      flashKind: "error",
      flashMessage: `An error has occured. freeCodeCamp have been notified. Error ID: ${eventId}`,
    },
  });
  return error;
}
