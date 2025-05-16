// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Emitter, Manager};
use tauri_plugin_deep_link::DeepLinkExt;
use utils::valid_sentry_dsn;

mod commands;
mod config;
mod error;
mod request;
mod secret;
mod utils;

pub struct SentryState {
    pub client: Option<sentry::ClientInitGuard>,
}

fn main() {
    let sentry_dsn = dotenvy_macro::dotenv!("SENTRY_DSN");
    let guard = if valid_sentry_dsn(sentry_dsn) {
        // NOTE: Events are only emitted, once the guard goes out of scope (on app close).
        // TODO: Might look into forcing some/all events to emit: https://docs.rs/sentry/latest/sentry/trait.Transport.html
        Some(sentry::init((
            sentry_dsn,
            sentry::ClientOptions {
                release: sentry::release_name!(),
                ..Default::default()
            },
        )))
    } else {
        None
    };

    let sentry_state = SentryState { client: guard };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_deep_link::init())
        // Ensure only one window of the app may be open at a time.
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // NOTE: `argv` is ordinarily double-checked for CSRF for runtime-registered deep links.
            //       However, deep links are only registered during runtime for development.
            println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
            // If app is already open, focus window when deep link is triggered
            let _ = app.get_webview_window("main")
                       .expect("no main window")
                       .set_focus();
            let callback_url = argv.get(1)
                .expect("no callback URL")
                .to_string();
            app.emit("auth0-redirect", callback_url).expect("failed to emit deep link event");
          }))
        .invoke_handler(tauri::generate_handler![
            commands::get_authorization_token,
            commands::set_authorization_token,
            commands::remove_authorization_token,
            commands::take_screenshot,
            commands::restart_app,
            commands::emit_to_sentry
        ])
        .manage(sentry_state)
        .setup(|app| {
            // Deep Link for app is registered during runtime as well as install,
            // because this is the only way to use deep links during development.
            #[cfg(desktop)]
            #[cfg(debug_assertions)]
            app.deep_link().register("exam-environment")?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
