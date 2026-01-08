import { createClient } from "@supabase/supabase-js";
import { fetch } from "@tauri-apps/plugin-http";

export const supabase = createClient(
  __SUPABASE_URL__,
  __SUPABASE_PUBLISHABLE__,
  {
    global: {
      // @ts-expect-error Unknown error
      fetch: fetch.bind(globalThis),
    },
  }
);

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
}

export async function captureEvent(event: Event) {
  try {
    const res = await supabase.from("events").insert(event);
    console.debug(
      event,
      res.count,
      res.data,
      res.error,
      res.status,
      res.statusText
    );
  } catch (e) {
    console.log(e);
  }
}

export function createEvent(
  kind: Event["kind"],
  meta: Event["meta"] = null
): Event {
  return { kind, meta };
}
