// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod commands;
mod config;
mod error;
mod request;
mod secret;
mod utils;

fn main() {
    let sentry_dsn = dotenvy_macro::dotenv!("SENTRY_DSN");
    // NOTE: Events are only emitted, once the guard goes out of scope (on app close).
    // TODO: Might look into forcing some/all events to emit: https://docs.rs/sentry/latest/sentry/trait.Transport.html
    let _guard = sentry::init((
        sentry_dsn,
        sentry::ClientOptions {
            release: sentry::release_name!(),
            ..Default::default()
        },
    ));

    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // In a debug build, disable content protection
            if cfg!(debug_assertions) {
                let webview_windows = app.webview_windows();
                let webview_window = webview_windows.into_values().next().unwrap();
                webview_window.set_content_protected(false).unwrap();
            }

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_authorization_token,
            commands::set_authorization_token,
            commands::remove_authorization_token,
            commands::take_screenshot,
            commands::restart_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
