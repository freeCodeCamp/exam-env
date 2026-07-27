import { createClient } from "@supabase/supabase-js";
import { fetch } from "@tauri-apps/plugin-http";
import { logger } from "@sentry/react";

import { logUsage } from "./telemetry";

const supabase =
  __SUPABASE_URL__ && __SUPABASE_PUBLISHABLE__
    ? createClient(__SUPABASE_URL__, __SUPABASE_PUBLISHABLE__, {
        global: {
          fetch: fetch.bind(globalThis),
        },
      })
    : ({
        from() {
          return { insert() {} };
        },
      } as unknown as ReturnType<typeof createClient>);

export const EventKind = {
  CAPTIONS_OPENED: "CAPTIONS_OPENED",
  QUESTION_VISIT: "QUESTION_VISIT",
  FOCUS: "FOCUS",
  BLUR: "BLUR",
  EXAM_EXIT: "EXAM_EXIT",
} as const;

type Meta = Record<string, unknown>;

interface Event {
  kind: keyof typeof EventKind;
  // timestamp: Date;
  meta: Meta | null;
  // ObjectId
  attempt_id: string;
}

export async function captureEvent(event: Event) {
  // Event capture is best-effort analytics, not application-critical
  try {
    const res = await supabase.from("events").insert(event);
    // Unconfigured builds use a no-op client that returns undefined; skip.
    if (!res) return;
    if (res.error) {
      logUsage("supabase.event_insert", {
        result: "error",
        kind: event.kind,
        status: res.status,
      });
      logger.warn("supabase event insert failed", {
        kind: event.kind,
        status: res.status,
        code: res.error.code,
        message: res.error.message,
      });
      return;
    }
    logUsage("supabase.event_insert", {
      result: "ok",
      status: res.status,
      kind: event.kind,
    });
  } catch (e) {
    logUsage("supabase.event_insert", {
      result: "exception",
      kind: event.kind,
    });
    logger.warn("supabase event insert threw", {
      kind: event.kind,
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

export function createEvent(
  kind: Event["kind"],
  attempt_id: Event["attempt_id"],
  meta: Event["meta"] = null,
): Event {
  return { kind, meta, attempt_id };
}
