use std::error::Error as _;

use sentry::capture_error;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

use crate::secret::get_authorization_token;

#[derive(Debug, Serialize, Deserialize)]
pub enum ErrorKind {
    Credential,
    FS,
    Serialization,
    Request,
    Client,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Error {
    /// Error for logs, debugging, and reporting
    pub debug: String,
    /// Kind of error
    pub kind: ErrorKind,
    /// Error message shown to user
    pub user: String,
}

impl Error {
    pub fn new(kind: ErrorKind, debug: String, user: &str) -> Self {
        Self {
            kind,
            debug,
            user: user.to_string(),
        }
    }
    fn add_context(&mut self, context: &str) {
        self.debug.push_str(context);
    }
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let stringed = match self.kind {
            ErrorKind::Credential => format!("Credential: {}", self.debug),
            ErrorKind::FS => format!("FS: {}", self.debug),
            ErrorKind::Serialization => format!("Serialization: {}", self.debug),
            ErrorKind::Request => format!("Request: {}", self.debug),
            ErrorKind::Client => format!("Client: {}", self.debug),
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
    ///
    /// NOTE: Calling this method does not capture the error in Sentry.
    fn emit(self, app: &AppHandle) -> T;
}

impl<T> PassToSentry<Result<T, Error>> for Result<T, Error> {
    fn capture(self) -> Result<T, Error> {
        match self {
            Err(mut e) => {
                configure_scope();

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

impl PassToSentry<Error> for Error {
    fn capture(mut self) -> Self {
        configure_scope();

        let sentry_uuid = capture_error(&self);

        self.add_context(&format!(" + UUID: {sentry_uuid}"));

        self
    }

    fn emit(self, app: &AppHandle) -> Self {
        let source = if let Some(s) = self.source() {
            s.to_string()
        } else {
            "unknown".to_string()
        };

        app.emit(
            "unrecoverable-error",
            UnrecoverableError {
                source,
                message: self.to_string(),
            },
        )
        .unwrap();

        self
    }
}

fn configure_scope() {
    if let Some(authorization_token) = get_authorization_token() {
        sentry::configure_scope(|scope| {
            let user = sentry::User {
                id: Some(authorization_token),
                ..Default::default()
            };
            scope.set_user(Some(user));
        });
    }
}
