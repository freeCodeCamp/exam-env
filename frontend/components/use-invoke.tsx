import { invoke, InvokeArgs } from "@tauri-apps/api/core";
import { useState } from "react";

import { assertError, Result } from "../utils/errors";

export function useInvoke<T>(cmd: string) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function invoker(args: InvokeArgs): Promise<Result<T>> {
    setIsPending(true);
    return mapErr<T>(invoke<T>(cmd, args));
  }

  async function mapErr<T>(promise: Promise<T>): Promise<Result<T>> {
    try {
      const data = await promise;
      setIsPending(false);
      return { error: null, data };
    } catch (e) {
      assertError(e);
      setError(e);
      return { error: e, data: null };
    }
  }

  return [invoker, isPending, error] as const;
}
