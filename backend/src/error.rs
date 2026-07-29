use std::error::Error as _;
use std::sync::RwLock;

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
#[serde(rename_all = "camelCase")]
pub struct Error {
    /// Error for logs, debugging, and reporting
    pub debug: String,
    /// Kind of error
    pub kind: ErrorKind,
    /// Error message shown to user
    pub user: String,
    /// Id of the Sentry event this error was reported as, when it was reported.
    pub event_id: Option<String>,
}

impl Error {
    pub fn new(kind: ErrorKind, debug: String, user: &str) -> Self {
        Self {
            kind,
            debug,
            user: user.to_string(),
            event_id: None,
        }
    }

    /// Adopts the id of the most recently captured Sentry event - i.e. the one a preceding `tracing::error!` produced through the Sentry tracing layer.
    ///
    /// Use this instead of [`PassToSentry::capture`] when the path already logs at ERROR: capturing as well would report the same failure twice.
    pub fn adopt_last_event_id(mut self) -> Self {
        self.event_id = sentry::last_event_id().map(|id| id.to_string());
        self
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
            Err(e) => Err(e.capture()),
            Ok(t) => Ok(t),
        }
    }

    fn emit(self, app: &AppHandle) -> Result<T, Error> {
        match self {
            Err(e) => Err(e.emit(app)),
            Ok(t) => Ok(t),
        }
    }
}

impl PassToSentry<Error> for Error {
    fn capture(mut self) -> Self {
        let sentry_uuid = capture_error(&self);

        self.event_id = Some(sentry_uuid.to_string());

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

/// Id of the frontend's session replay, as reported by `commands::set_replay_id`.
///
/// Backend errors are captured in the backend, so without this the replay of the
/// session that hit the error would not be linked to the resulting issue.
/// Read by [`crate::sentry_filter::before_send`], which enriches every outgoing
/// event - Sentry's Rust scopes are per-thread, and commands run on whichever
/// worker thread the runtime picks, so scope-based enrichment is unreliable here.
static REPLAY_ID: RwLock<Option<String>> = RwLock::new(None);

pub fn set_replay_id(replay_id: Option<String>) {
    if let Ok(mut guard) = REPLAY_ID.write() {
        *guard = replay_id;
    }
}

pub fn replay_id() -> Option<String> {
    REPLAY_ID.read().ok().and_then(|guard| guard.clone())
}

/// Id identifying the user across events: the inner token id, never the raw JWT.
pub fn sentry_user_id() -> Option<String> {
    get_authorization_token().and_then(|token| crate::utils::token_user_id(&token))
}
