import { invoke } from "@tauri-apps/api/core";
import { assertError, Result } from "./errors";

/**
 * Forcefully restarts the app.
 */
export async function restartApp() {
  await invoke("restart_app");
}

/**
 * Takes a screenshot of the main monitor.
 */
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
