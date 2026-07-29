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
mod sentry_filter;
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
                // Captured errors (Credential/FS/Request/...) carry no
                // stacktrace of their own; attach the capture-site stack so
                // they are locatable once debug files are uploaded in CI.
                attach_stacktrace: true,
                // Release health: crash-free sessions/users per release.
                auto_session_tracking: true,
                // Performance monitoring: emit transactions/spans for the
                // `#[tracing::instrument]`-ed commands so command latency and
                // the update-check path are observable. Volume is low (one
                // window per user), so full sampling is affordable.
                traces_sample_rate: 1.0,
                before_send: Some(std::sync::Arc::new(sentry_filter::before_send)),
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

    let run_result = tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        // Ensure only one window of the app may be open at a time.
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            // NOTE: `argv` is ordinarily double-checked for CSRF for runtime-registered deep links.
            //       However, deep links are only registered during runtime for development.
            // println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
            // If app is already open, focus window when deep link is triggered
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
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
            commands::set_replay_id,
            commands::check,
            commands::download_and_install,
        ])
        .manage(sentry_state)
        .setup(|app| {
            // Deep Link for app is registered during runtime as well as install,
            // because this is the only way to use deep links during development.
            // Deep-link registration can fail on minimal Linux environments that
            // lack desktop-integration tooling (e.g. `update-desktop-database`).
            // That is non-fatal: the app runs fine without the OS-registered
            // scheme, so log and continue instead of crashing the setup hook.
            #[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
            if let Err(e) = app.deep_link().register("exam-environment") {
                tracing::warn!(error = ?e, "failed to register deep-link scheme; continuing");
            }

            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);

                // Running from the mounted DMG (or app-translocation) makes
                // the install location read-only: updates and other writes
                // fail with "Read-only file system (os error 30)". Warn the
                // user up front instead of surfacing raw errors later.
                let readonly_location = std::env::current_exe()
                    .map(|exe| {
                        let path = exe.to_string_lossy().into_owned();
                        path.starts_with("/Volumes/") || path.contains("/AppTranslocation/")
                    })
                    .unwrap_or(false);
                if readonly_location {
                    use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
                    tracing::warn!("app is running from a read-only location");
                    app.dialog()
                        .message(
                            "The app is running from a read-only location (for example, straight from the downloaded disk image), so it cannot update itself or save data.\n\nQuit the app, drag it into the Applications folder, and reopen it from there.",
                        )
                        .title("Move to Applications")
                        .kind(MessageDialogKind::Warning)
                        .show(|_| {});
                }
            }

            // In debug builds, allow window content to be visible
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.set_content_protected(false)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!());

    if let Err(e) = run_result {
        // A missing/broken WebView2 runtime means no window can ever appear,
        // so remediation guidance has to be a native dialog.
        #[cfg(windows)]
        {
            let message = e.to_string();
            if message.contains("failed to create webview")
                || message.contains("webview runtime")
            {
                show_webview_unavailable_dialog(&message);
            }
        }

        // Panic (matching the previous `.expect`) so the Sentry panic
        // integration captures the failure and the client guard flushes
        // during unwind.
        panic!("error while running tauri application: {e:?}");
    }
}

/// Shown when the webview cannot be created (missing/broken WebView2
/// runtime, unwritable data folder, ...). Uses a plain Win32 dialog because
/// no webview UI is available at this point.
#[cfg(windows)]
fn show_webview_unavailable_dialog(detail: &str) {
    rfd::MessageDialog::new()
        .set_level(rfd::MessageLevel::Error)
        .set_title("freeCodeCamp Exam Environment")
        .set_description(format!(
            "The app could not start its browser window (Microsoft Edge WebView2).\n\n\
             Repairing or reinstalling the WebView2 Runtime usually fixes this:\n\
             https://developer.microsoft.com/microsoft-edge/webview2/\n\n\
             Details: {detail}"
        ))
        .show();
}
