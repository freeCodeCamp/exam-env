use std::error::Error as _;

use sentry::capture_error;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Serialize, Deserialize)]
pub enum Error {
    CredentialError(String),
    FSError(String),
    ScreenshotError(String),
    SerializationError(String),
    RequestError(String),
    ClientError(String),
}

impl Error {
    fn add_context(&mut self, context: &str) {
        match self {
            Error::CredentialError(s) => s.push_str(context),
            Error::FSError(s) => s.push_str(context),
            Error::ScreenshotError(s) => s.push_str(context),
            Error::SerializationError(s) => s.push_str(context),
            Error::RequestError(s) => s.push_str(context),
            Error::ClientError(s) => s.push_str(context),
        };
    }
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let stringed = match self {
            Error::CredentialError(s) => format!("CredentialError: {s}"),
            Error::FSError(s) => format!("FSError: {s}"),
            Error::ScreenshotError(s) => format!("ScreenshotError: {s}"),
            Error::SerializationError(s) => format!("SerializationError: {s}"),
            Error::RequestError(s) => format!("RequestError: {s}"),
            Error::ClientError(s) => format!("ClientError: {s}"),
        };

        write!(f, "{}", stringed)
    }
}

impl std::error::Error for Error {}

#[derive(Clone, Serialize)]
pub struct UnrecoverableError {
    source: String,
    message: String,
}

pub trait PassToSentry<T> {
    /// A transparent wrapper around a `Result` that passes a `crate::Error` to Sentry.
    fn capture(self) -> T;

    /// Emits the error as an `UnrecoverableError` to the client to display.
    fn emit(self, app: &AppHandle) -> T;
}

impl<T> PassToSentry<Result<T, Error>> for Result<T, Error> {
    fn capture(self) -> Result<T, Error> {
        match self {
            Err(mut e) => {
                let sentry_uuid = capture_error(&e);
                e.add_context(&format!(" + UUID: {sentry_uuid}"));

                Err(e)
            }
            Ok(t) => Ok(t),
        }
    }

    fn emit(self, app: &AppHandle) -> Result<T, Error> {
        match self {
            Err(e) => {
                let source = if let Some(s) = e.source() {
                    s.to_string()
                } else {
                    "unknown".to_string()
                };

                app.emit(
                    "unrecoverable-error",
                    UnrecoverableError {
                        source,
                        message: e.to_string(),
                    },
                )
                .unwrap();

                Err(e)
            }
            Ok(t) => Ok(t),
        }
    }
}

impl PassToSentry<()> for Error {
    fn capture(self) -> () {
        let _sentry_uuid = capture_error(&self);
    }

    fn emit(self, app: &AppHandle) -> () {
        let source = if let Some(s) = self.source() {
            s.to_string()
        } else {
            "unknown".to_string()
        };

        let sentry_uuid = capture_error(&self);

        let message = format!("UUID: {}\n{}", sentry_uuid, self.to_string());

        app.emit(
            "unrecoverable-error",
            UnrecoverableError { source, message },
        )
        .unwrap();
    }
}
