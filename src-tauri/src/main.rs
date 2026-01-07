// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
#[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
use tauri_plugin_deep_link::DeepLinkExt;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utils::valid_sentry_dsn;

mod commands;
mod error;
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
                environment: Some(utils::ENVIRONMENT.into()),
                enable_logs: true,
                ..Default::default()
            },
        )))
    } else {
        None
    };

    let sentry_layer =
        sentry::integrations::tracing::layer().event_filter(|md| match *md.level() {
            // Capture error level events as Sentry events
            // These are grouped into issues, representing high-severity errors to act upon
            tracing::Level::ERROR => {
                sentry::integrations::tracing::EventFilter::Event
                    | sentry::integrations::tracing::EventFilter::Log
            }
            // Ignore trace level events, as they're too verbose
            tracing::Level::TRACE => sentry::integrations::tracing::EventFilter::Ignore,
            // Capture everything else as a traditional structured log
            _ => sentry::integrations::tracing::EventFilter::Log,
        });

    // Only enabled when debug assertions are on (i.e. in debug builds)
    let stdio_layer = if cfg!(debug_assertions) {
        Some(tracing_subscriber::fmt::layer().pretty())
    } else {
        None
    };

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!(
                    "error,tauri_plugin_updater=info,{}=info",
                    env!("CARGO_CRATE_NAME")
                )
                .into()
            }),
        )
        .with(stdio_layer)
        .with(sentry_layer)
        .init();

    let sentry_state = SentryState { client: guard };

    let sentry_release_name = sentry::release_name!().unwrap_or_default();

    info!(
        environment = utils::ENVIRONMENT,
        "Start: {sentry_release_name}"
    );

    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        // Ensure only one window of the app may be open at a time.
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            // NOTE: `argv` is ordinarily double-checked for CSRF for runtime-registered deep links.
            //       However, deep links are only registered during runtime for development.
            // println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
            // If app is already open, focus window when deep link is triggered
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
            // let callback_url = argv.get(1)
            //     .expect("no callback URL")
            //     .to_string();
            // app.emit("auth0-redirect", callback_url).expect("failed to emit deep link event");
        }))
        .plugin(tauri_plugin_log::Builder::new().skip_logger().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_authorization_token,
            commands::set_authorization_token,
            commands::remove_authorization_token,
            // commands::take_screenshot,
            commands::restart_app,
            commands::emit_to_sentry,
            commands::check,
        ])
        .manage(sentry_state)
        .setup(|app| {
            // Deep Link for app is registered during runtime as well as install,
            // because this is the only way to use deep links during development.
            #[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
            app.deep_link().register("exam-environment")?;

            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }

            // In debug builds, allow window content to be visible
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.set_content_protected(false)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
