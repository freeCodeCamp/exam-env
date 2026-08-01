import { Channel, invoke } from "@tauri-apps/api/core";

/**
 * Forcefully restarts the app.
 */
export async function restartApp() {
  await invoke("restart_app");
}

export type DownloadProgress =
  | { event: "Started"; data: { contentLength?: number } }
  | { event: "Progress"; data: { chunkLength: number } }
  | { event: "Finished" };

/**
 * Downloads and installs the update found by `checkForUpdate`.
 *
 * The backend drives the updater and reports its own failures, so a rejection
 * here is an `FCCError` that has already been captured in Sentry - display it,
 * never capture it again.
 */
export async function downloadAndInstallUpdate(
  rid: number,
  onProgress: (progress: DownloadProgress) => void,
) {
  const channel = new Channel<DownloadProgress>();
  channel.onmessage = onProgress;

  await invoke("download_and_install", { rid, onProgress: channel });
}
