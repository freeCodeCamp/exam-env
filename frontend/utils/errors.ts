/**
 * Error shapes and the plain functions that read them. Deliberately free of
 * Sentry: reporting lives in `sentry.ts`, which depends on this module.
 */

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

/** Bodies that carry no information. An error the API does not recognise is
 * serialised with `JSON.stringify`, and a thrown `Error` stringifies to "{}" -
 * which reached the user as a flash message reading "{}". */
const EMPTY_MESSAGES = ["{}", "[]", "null", "undefined", "[object Object]"];

/** Whether a message says anything at all - i.e. is worth showing to a user or
 * grouping a Sentry issue on. */
export function isInformative(message?: string | null): message is string {
  const trimmed = message?.trim();
  return !!trimmed && !EMPTY_MESSAGES.includes(trimmed);
}

const UNKNOWN_ERROR =
  "An unexpected error occurred. Please try again in a few moments.";

export function getErrorMessage(e: unknown): string {
  console.error(e);
  if (isFCCError(e)) {
    return isInformative(e.user) ? e.user : UNKNOWN_ERROR;
  }
  if (e instanceof Error) {
    return isInformative(e.message) ? e.message : UNKNOWN_ERROR;
  }
  if (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as Record<string, unknown>).message === "string"
  ) {
    const { message } = e as { message: string };
    return isInformative(message) ? message : UNKNOWN_ERROR;
  }
  // The serialised value is the only description there is, but it is only worth
  // showing when it describes something.
  const serialized = JSON.stringify(e);
  return isInformative(serialized)
    ? "An unexpected error occurred: " + serialized
    : UNKNOWN_ERROR;
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

/** Id of the Sentry event the backend reported this error as, for the user to
 * quote to support. */
export function backendEventId(e: unknown): string | undefined {
  return isFCCError(e) ? (e.eventId ?? undefined) : undefined;
}
