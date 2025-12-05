import { captureException } from "@sentry/react";
import { useNavigate } from "@tanstack/react-router";
import { LandingRoute } from "../pages/landing";

export type Result<T> =
  | { error: null; data: T }
  | { error: FCCError; data: null };

export type FCCError = {
  debug: string;
  kind: "Credential" | "FS" | "Serialization" | "Request" | "Client";
  user: string;
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

export function captureAndNavigate(
  errorStr: string,
  navigate: ReturnType<typeof useNavigate>
) {
  const error = new Error(errorStr);
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
