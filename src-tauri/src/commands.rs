use tauri::{AppHandle, State};

use crate::{
    error::{Error, PassToSentry},
    secret, SentryState,
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
