use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, ResourceId, Runtime, State, Url, WebviewWindow, ipc::Channel};
use tauri_plugin_http::reqwest;
use tauri_plugin_updater::{Update, UpdaterExt};
use tracing::{debug, error, info, warn};

use crate::{
    SentryState, error,
    error::{Error, ErrorKind, PassToSentry},
    secret,
    utils::{ENVIRONMENT, ORIGIN},
};

#[tracing::instrument]
#[tauri::command]
pub fn get_authorization_token() -> Option<String> {
    secret::get_authorization_token()
}

/// Sets the Exam Environment Authorization Token, after ensuring it is valid
// `new_authorization_token` is the secret itself - never record it as a span field.
// Keyring errors are already captured to Sentry in `secret`, so no `err` here.
#[tracing::instrument(skip(new_authorization_token))]
#[tauri::command]
pub fn set_authorization_token(new_authorization_token: String) -> Result<(), Error> {
    secret::set_authorization_token(&new_authorization_token)
}

#[tracing::instrument]
#[tauri::command]
pub fn remove_authorization_token() -> Result<(), Error> {
    secret::remove_authorization_token()
}

#[tracing::instrument(skip(app))]
#[tauri::command]
pub fn restart_app(app: AppHandle) {
    app.restart()
}

/// Records the id of the frontend's session replay, so backend errors captured
/// from here on are linked to the recording of the session that hit them.
#[tracing::instrument]
#[tauri::command]
pub fn set_replay_id(replay_id: Option<String>) {
    error::set_replay_id(replay_id);
}

/// Passes the error string to Sentry as a `Client` error, and flushes the Sentry client.
#[tracing::instrument(skip(sentry_state, app))]
#[tauri::command]
pub fn emit_to_sentry(error_str: String, sentry_state: State<SentryState>, app: AppHandle) {
    let error = Error::new(ErrorKind::Client, error_str, "Client error");
    let _ = error.capture().emit(&app);

    if let Some(client) = &sentry_state.client {
        client.flush(None);
    }
}

/// "node_id": "RE_kwDONN3_Oc4OnRwu",
/// "tag_name": "staging/0.5.3",
/// "target_commitish": "main",
/// "name": "v0.5.3/staging",
/// "draft": false,
/// "immutable": false,
/// "prerelease": true,
/// "created_at": "2025-09-05T11:30:13Z",
/// "updated_at": "2025-09-05T20:59:23Z",
/// "published_at": "2025-09-05T20:59:23Z",
#[derive(Deserialize, Debug)]
struct GitHubRelease {
    name: String,
    draft: bool,
    assets: Vec<GitHubReleaseAsset>,
}

#[derive(Deserialize, Debug)]
struct GitHubReleaseAsset {
    name: String,
    browser_download_url: String,
}

#[derive(Serialize, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Metadata {
    rid: ResourceId,
    current_version: String,
    version: String,
    date: Option<String>,
    body: Option<String>,
    raw_json: serde_json::Value,
}

/// Dynamically uses the api location to determine what environment the app release comes from.
///
/// Then, fetches the latest release for that environment from GitHub, and constructs update metadata from it.
// A failed update check is an expected, recoverable "no update right now" path
// (offline, timeout, 5xx, fallback exhausted), not a bug. Log the returned error
// at WARN so it lands in Sentry Logs for visibility but never becomes an issue.
#[tracing::instrument(skip(app, webview), err(level = "warn"))]
#[tauri::command]
pub async fn check<R: Runtime>(
    app: AppHandle<R>,
    webview: WebviewWindow<R>,
) -> Result<Option<Metadata>, Error> {
    let update = get_update(app).await?;

    // https://github.com/tauri-apps/plugins-workspace/blob/d3d290ab8a8913981a98e2eb7f2c5d4aba3bc36c/plugins/updater/src/commands.rs#L74
    if let Some(update) = update {
        let formatted_date = if let Some(date) = update.date {
            let formatted_date = date
                .format(&time::format_description::well_known::Rfc3339)
                .map_err(|e| {
                    error!(error = ?e, date = ?date, "failed to format update date as rfc3339");
                    Error::new(
                        ErrorKind::Serialization,
                        format!("failed to format date: {e}"),
                        "Unable to download latest update",
                    )
                })?;
            Some(formatted_date)
        } else {
            None
        };
        let metadata = Metadata {
            current_version: update.current_version.clone(),
            version: update.version.clone(),
            date: formatted_date,
            body: update.body.clone(),
            raw_json: update.raw_json.clone(),
            rid: webview.resources_table().add(update),
        };
        Ok(Some(metadata))
    } else {
        Ok(None)
    }
}

/// Progress of [`download_and_install`], mirroring the shape the updater plugin's
/// JS API used to emit so the frontend can render the same progress bar.
#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum DownloadProgress {
    Started { content_length: Option<u64> },
    Progress { chunk_length: usize },
    Finished,
}

/// Downloads and installs the update found by [`check`].
///
/// The updater plugin exposes this to JS directly, but then the failure is
/// produced inside the plugin and reaches the frontend as a bare string: no
/// status, no endpoint, and nothing captured. Driving it from here keeps the
/// report where the context is - the download url, the version, and the response
/// status are all in hand - and keeps to one capture per failure.
#[tracing::instrument(skip(webview, on_progress))]
#[tauri::command]
pub async fn download_and_install<R: Runtime>(
    webview: WebviewWindow<R>,
    rid: ResourceId,
    on_progress: Channel<DownloadProgress>,
) -> Result<(), Error> {
    let update = webview.resources_table().get::<Update>(rid).map_err(|e| {
        // The rid comes straight from `check`'s metadata, so a missing resource
        // means the frontend called this with a stale or fabricated id.
        error!(error = ?e, rid = ?rid, "no pending update for resource id");
        Error::new(
            ErrorKind::Request,
            format!("failed to get update resource {rid:?}: {e}"),
            "Unable to download the latest update",
        )
        .adopt_last_event_id()
    })?;

    let host = update
        .download_url
        .host_str()
        .unwrap_or("unknown")
        .to_string();
    let version = update.version.clone();
    debug!(%host, %version, "downloading update");

    let mut started = false;
    update
        .download_and_install(
            |chunk_length, content_length| {
                if !started {
                    started = true;
                    let _ = on_progress.send(DownloadProgress::Started { content_length });
                }
                let _ = on_progress.send(DownloadProgress::Progress { chunk_length });
            },
            || {
                let _ = on_progress.send(DownloadProgress::Finished);
            },
        )
        .await
        .map_err(|e| {
            error!(error = ?e, %host, %version, "failed to download and install update");
            Error::new(
                ErrorKind::Request,
                format!("failed to download and install update {version} from {host}: {e}"),
                "Unable to download the latest update",
            )
            .adopt_last_event_id()
        })?;

    info!(%version, "update installed");
    Ok(())
}

#[tracing::instrument]
async fn get_gh_latest_json() -> Result<Option<Url>, Error> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://api.github.com/repos/freeCodeCamp/exam-env/releases")
        .header("User-Agent", "Exam-Environment")
        .header("Origin", ORIGIN)
        .send()
        .await
        .map_err(|e| {
            warn!(error = ?e, origin = ORIGIN, "failed to request releases");
            Error::new(
                ErrorKind::Request,
                format!("failed to request releases: {e}"),
                "Unable to fetch releases to check for updates",
            )
        })?
        .error_for_status()
        .map_err(|e| {
            warn!(error = ?e, status = ?e.status(), "releases request returned a non-success status");
            Error::new(
                ErrorKind::Request,
                format!("failed to request releases, non-200 status code: {e}"),
                "Unable to fetch releases to check for updates",
            )
        })?;

    let status = response.status();
    let body = response.text().await.map_err(|e| {
        warn!(error = ?e, %status, "failed to read releases response body");
        Error::new(
            ErrorKind::Request,
            format!("failed to read releases response body, status {status}: {e}"),
            "Unable to fetch releases to check for updates",
        )
    })?;

    let releases: Vec<GitHubRelease> = serde_json::from_str(&body).map_err(|e| {
        // The body snippet distinguishes an interstitial (Cloudflare page, HTML
        // redirect, truncated response) from an actual GitHub schema change.
        let snippet: String = body.chars().take(200).collect();
        warn!(
            error = ?e,
            %status,
            body_snippet = %snippet,
            body_len = body.len(),
            "failed to deserialize releases as json"
        );
        Error::new(
            ErrorKind::Serialization,
            format!("failed to deserialize releases as json, status {status}, body starts: {snippet:?}: {e}"),
            "Unable to fetch releases to check for updates",
        )
    })?;

    let release = match releases
        .iter()
        .find(|r| !r.draft && r.name.ends_with(&format!("/{ENVIRONMENT}")))
    {
        Some(release) => release,
        None => {
            info!(
                "no release found for environment {ENVIRONMENT} in last {} releases",
                releases.len()
            );
            return Ok(None);
        }
    };

    let assets = &release.assets;
    let asset = assets
        .iter()
        .find(|a| a.name == "latest.json")
        .ok_or_else(|| {
            error!(
                release = %release.name,
                assets = ?assets.iter().map(|a| &a.name).collect::<Vec<_>>(),
                "no latest.json asset in release"
            );
            Error::new(
                ErrorKind::Request,
                "failed to find latest.json asset in release".to_string(),
                "Unable to fetch releases to check for updates",
            )
        })?;

    let update_url = Url::parse(&asset.browser_download_url).map_err(|e| {
        error!(
            error = ?e,
            url = %asset.browser_download_url,
            release = %release.name,
            "failed to parse latest.json asset url"
        );
        Error::new(
            ErrorKind::Serialization,
            format!("failed to parse latest.json url: {e}"),
            "Unable to fetch release to check for updates",
        )
    })?;

    Ok(Some(update_url))
}

fn get_r2_latest_json() -> Result<Url, Error> {
    let raw_url =
        format!("https://exam-environment-downloads.freecodecamp.org/{ENVIRONMENT}/latest.json");
    let update_url = Url::parse(&raw_url).map_err(|e| {
        error!(error = ?e, url = %raw_url, environment = ENVIRONMENT, "failed to parse r2 latest.json url");
        Error::new(
            ErrorKind::Serialization,
            format!("failed to parse latest.json url: {e}"),
            "Unable to fetch release to check for updates",
        )
    })?;

    Ok(update_url)
}

/// Default to R2 update url. If that fails, fallback to GitHub Releases url
async fn get_update<R: Runtime>(app: AppHandle<R>) -> Result<Option<Update>, Error> {
    let r2_update_url = get_r2_latest_json()?;

    match try_update_url(&app, r2_update_url).await {
        Ok(update) => Ok(update),
        Err(e) => {
            // R2 failing then falling back to GitHub is an expected, recoverable
            // path, not an error worth a Sentry issue. Log at warn so it stays
            // out of the error-event stream.
            warn!(error = ?e, "error checking update from r2, falling back to GitHub");
            let gh_update_url = if let Some(url) = get_gh_latest_json().await? {
                url
            } else {
                return Ok(None);
            };

            try_update_url(&app, gh_update_url).await
        }
    }
}

async fn try_update_url<R: Runtime>(
    app: &AppHandle<R>,
    update_url: Url,
) -> Result<Option<Update>, Error> {
    let mut update_builder = app.updater_builder();

    if let Some(t) = tauri_plugin_updater::target() {
        debug!("detected target: {t}");
        if t == "windows-aarch64" {
            update_builder = update_builder.target("windows-x86_64");
        }
    }

    let host = update_url.host_str().unwrap_or("unknown").to_string();

    update_builder
        .endpoints(vec![update_url])
        .map_err(|e| {
            error!(error = ?e, %host, "failed to set updater endpoint");
            Error::new(
                ErrorKind::Request,
                format!("failed to create updater builder: {e}"),
                "Unable to download latest update",
            )
        })?
        .header("Origin", ORIGIN)
        .map_err(|e| {
            error!(error = ?e, origin = ORIGIN, "failed to add origin header to updater builder");
            Error::new(
                ErrorKind::Request,
                format!("failed to add origin header to updater builder: {e}"),
                "Unable to download latest update",
            )
        })?
        .build()
        .map_err(|e| {
            error!(error = ?e, %host, "failed to build updater");
            Error::new(
                ErrorKind::Request,
                format!("failed to build updater: {e}"),
                "Unable to download latest update",
            )
        })?
        .check()
        .await
        .map_err(|e| {
            warn!(error = ?e, %host, "failed to check for updates");
            Error::new(
                ErrorKind::Request,
                format!("failed to check for updates: {e}"),
                "Unable to download latest update",
            )
        })
}
