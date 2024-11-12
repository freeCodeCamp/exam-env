import { invoke } from "@tauri-apps/api/core";
import { assertError, Result } from "./errors";

export async function takeScreenshot(): Promise<Result<null>> {
  try {
    await invoke("take_screenshot");
    return { data: null, error: null };
  } catch (e: unknown) {
    console.error(e);
    assertError(e);
    return { error: e, data: null };
  }
}
