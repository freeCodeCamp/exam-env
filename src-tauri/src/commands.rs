use screenshots::Screen;
use tauri::{AppHandle, State, Window};

use crate::{
    error::{Error, PassToSentry},
    request::post_screenshot,
    secret, utils, SentryState,
};

#[tauri::command]
pub async fn take_screenshot(window: Window) -> Result<(), Error> {
    // Content protect prevents screenshots of the application window. So, for the short duration of the screenshots, it needs disabled.
    window
        .set_content_protected(false)
        .map_err(|e| {
            Error::Screenshot(format!(
                "Unable to set window to unprotected mode before screenshot: {}",
                e
            ))
        })
        .capture()?;

    let screens = Screen::all()
        .map_err(|e| Error::Screenshot(format!("Unable to return all screens: {}", e)))
        .capture()?;

    if let Some(main_screen) = screens.iter().find(|s| s.display_info.is_primary) {
        let main_screen_img = main_screen
            .capture()
            .map_err(|e| Error::Screenshot(format!("Unable to capture screen: {}", e)))
            .capture()?;

        // If in debug mode, do not set the window back to protected mode.
        #[cfg(not(debug_assertions))]
        {
            // Inability to set window to content_protected == true should not prevent continuation
            let _window_protected = window
                .set_content_protected(true)
                .map_err(|e| {
                    Error::Screenshot(format!(
                        "Unable to set window back to protected mode after screenshot: {}",
                        e
                    ))
                })
                .capture();
        }

        let image = utils::image_to_bytes(main_screen_img);
        post_screenshot(image).await?;
    } else {
        return Err(Error::Screenshot(
            "No main screen found to take screenshot".to_string(),
        ));
    }

    Ok(())
}

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
