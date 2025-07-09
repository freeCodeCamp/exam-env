export type Result<T> =
  | { error: null; data: T }
  | { error: FCCError; data: null };

export type FCCError =
  | { ValidationError: { message: string; id?: string } }
  | { FSError: string }
  | { SerializationError: string };

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
  response: { status: number };
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
