import { invoke } from "@tauri-apps/api/core";
import { assertError, Result } from "./errors";
import { AppStore } from "./types";

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

export async function getAppStore(): Promise<Result<AppStore>> {
  try {
    const store = await invoke<AppStore>("get_app_store");
    return { data: store, error: null };
  } catch (e: unknown) {
    console.error(e);
    assertError(e);
    return { error: e, data: null };
  }
}
