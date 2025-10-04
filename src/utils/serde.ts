/**
 * Recursively traverses an object and converts ISO date strings to Date objects.
 */
export function deserializeDates<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (typeof obj === "string") {
    const date = new Date(obj);
    if (!isNaN(date.getTime())) {
      return date as T;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deserializeDates(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = deserializeDates(value);
    }
    return result as T;
  }

  return obj as T;
}
