// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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
                traces_sample_rate: 1.0,
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
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| format!("{}=info", env!("CARGO_CRATE_NAME")).into()),
        )
        .with(stdio_layer)
        .with(sentry_layer)
        .init();

    let sentry_state = SentryState { client: guard };

    info!(
        environment = utils::ENVIRONMENT,
        version = ?sentry::release_name!().unwrap(),
        "Start"
    );

    tauri::Builder::default()
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
