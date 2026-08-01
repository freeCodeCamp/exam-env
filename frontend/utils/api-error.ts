/**
 * The API failure type and the endpoint names it reports against.
 *
 * Separate from `fetch.ts` (which performs the requests) and from `sentry.ts`
 * (which reports them) so both can depend on it without depending on each other.
 */

/** `METHOD /path` per endpoint. Shared by the span names in `fetch.ts` and by
 * {@link ApiError}, so a reported failure names the endpoint the same way the
 * trace does. */
export const ENDPOINTS = {
  tokenMeta: "GET /exam-environment/token-meta",
  generatedExam: "POST /exam-environment/exam/generated-exam",
  examAttempt: "POST /exam-environment/exam/attempt",
  exams: "GET /exam-environment/exams",
  examAttempts: "GET /exam-environment/exams/{examId}/attempts",
} as const;

export type Endpoint = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    /** The endpoint, not the resolved URL: it must be identical across users and
     * releases for a report to group stably. */
    public readonly endpoint: Endpoint,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** A failure the server may recover from on its own - worth retrying, and not
 * evidence of anything wrong with the request. */
export function isTransientApiError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status >= 500;
}

export function retryTransientApiError(failureCount: number, error: Error) {
  return failureCount < 2 && isTransientApiError(error);
}
