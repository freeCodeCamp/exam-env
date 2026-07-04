import { addBreadcrumb, logger } from "@sentry/react";

/**
 * Telemetry helpers built on Sentry. Two primitives:
 *
 * - {@link logUsage}: a discrete, queryable usage event emitted as a Sentry
 *   structured log (requires `enableLogs` in `Sentry.init`). Aggregate these in
 *   Sentry Logs/Explore to answer "how is the app used" - logins, device-check
 *   outcomes, update adoption, etc. We deliberately do NOT log exam-funnel
 *   progress (question-by-question), only coarse lifecycle/auth/update signals.
 * - {@link trackAction}: a user-intent breadcrumb attached to the current scope.
 *   It is not searchable on its own; it rides along with the next captured error
 *   to show the path that led there.
 *
 * Never pass the authorization token, exam questions, or answer content into
 * either - usage signals must stay free of PII and exam material.
 */

/** Discrete usage event -> Sentry Logs (searchable, aggregatable). */
export function logUsage(
  event: string,
  attributes: Record<string, unknown> = {},
) {
  logger.info(event, attributes);
}

/** User-intent breadcrumb for error context. */
export function trackAction(message: string, data?: Record<string, unknown>) {
  addBreadcrumb({ category: "user-action", level: "info", message, data });
}
