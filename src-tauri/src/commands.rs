use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, ResourceId, Runtime, State, Url, WebviewWindow};
use tauri_plugin_http::reqwest;
use tauri_plugin_updater::UpdaterExt;

use crate::{
    error::{Error, PassToSentry},
    secret,
    utils::ENVIRONMENT,
    SentryState,
};

#[tauri::command]
pub fn get_authorization_token() -> Option<String> {
    secret::get_authorization_token()
}

/// Sets the Exam Environment Authorization Token, after ensuring it is valid
#[tauri::command]
pub fn set_authorization_token(new_authorization_token: String) -> Result<(), Error> {
    secret::set_authorization_token(&new_authorization_token)
}

#[tauri::command]
pub fn remove_authorization_token() -> Result<(), Error> {
    secret::remove_authorization_token()
}

#[tauri::command]
pub fn restart_app(app: AppHandle) {
    app.restart()
}

/// Passes the error string to Sentry as a `Client` error, and flushes the Sentry client.
#[tauri::command]
pub fn emit_to_sentry(error_str: String, sentry_state: State<SentryState>, app: AppHandle) {
    let error = Error::Client(error_str);
    let _ = error.capture().emit(&app);

    if let Some(client) = &sentry_state.client {
        client.flush(None);
    }
}

#[derive(Deserialize, Debug)]
struct GitHubRelease {
    name: String,
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
#[tauri::command]
pub async fn check<R: Runtime>(
    app: AppHandle<R>,
    webview: WebviewWindow<R>,
) -> Result<Option<Metadata>, Error> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://api.github.com/repos/freeCodeCamp/exam-env/releases")
        .header("User-Agent", "Exam-Environment")
        .send()
        .await
        .map_err(|e| Error::Request(format!("failed to request releases: {}", e)))
        .capture()?;

    let releases: Vec<GitHubRelease> = response
        .json()
        .await
        .map_err(|e| Error::Serialization(format!("failed to deserialize releases as json: {}", e)))
        .capture()?;

    // NOTE: This could fail if `/<ENVIRONMENT>` release has not been made in last 30 releases
    let release = releases
        .iter()
        .find(|r| r.name.ends_with(&format!("/{ENVIRONMENT}")))
        .ok_or(Error::Request(format!(
            "failed to find release for environment: {ENVIRONMENT}"
        )))
        .capture()?;
    let assets = &release.assets;
    let asset = assets
        .iter()
        .find(|a| a.name == "latest.json")
        .ok_or(Error::Request(
            "failed to find latest.json asset in release".to_string(),
        ))
        .capture()?;

    let update_url = Url::parse(&asset.browser_download_url)
        .map_err(|e| Error::Serialization(format!("failed to parse latest.json url: {}", e)))
        .capture()?;

    let update = app
        .updater_builder()
        .endpoints(vec![update_url.clone()])
        .map_err(|e| {
            Error::Request(format!(
                "failed to create updater builder with endpoint '{update_url:?}': {}",
                e
            ))
        })
        .capture()?
        .build()
        .map_err(|e| Error::Request(format!("failed to build updater : {}", e)))
        .capture()?
        .check()
        .await
        .map_err(|e| Error::Request(format!("failed to check for updates: {}", e)))
        .capture()?;

    // https://github.com/tauri-apps/plugins-workspace/blob/d3d290ab8a8913981a98e2eb7f2c5d4aba3bc36c/plugins/updater/src/commands.rs#L74
    if let Some(update) = update {
        let formatted_date = if let Some(date) = update.date {
            let formatted_date = date
                .format(&time::format_description::well_known::Rfc3339)
                .map_err(|e| Error::Serialization(format!("failed to format date: {}", e)))?;
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
