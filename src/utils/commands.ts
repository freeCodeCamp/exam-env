import { invoke } from "@tauri-apps/api/core";

/**
 * Forcefully restarts the app.
 */
export async function restartApp() {
  await invoke("restart_app");
}
