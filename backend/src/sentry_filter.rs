//! Sentry `before_send` event filtering.
//!
//! Keeps non-actionable noise out of Sentry and consolidates fragmented issues
//! before events are sent. Wired up via [`crate::sentry_filter::before_send`] in
//! the client's `ClientOptions`.

use sentry::protocol::Event;

/// Substrings identifying non-actionable failures that are dropped before being
/// sent to Sentry. They are recoverable network/update-server conditions or
/// platform prerequisites on the user's machine, not app bugs:
/// - Update check/download: `get_update` falls back R2 -> GitHub and the updater
///   plugin surfaces transient endpoint failures, so a failed check is an
///   expected "no update right now" path (offline user, timeout, DNS, 5xx).
/// - Linux desktop prerequisites: minimal/headless installs without desktop
///   integration (`update-desktop-database`) or a display server (GTK) cannot
///   run a GUI app; nothing in our code can change that.
const NON_ACTIONABLE_NOISE_SIGNATURES: &[&str] = &[
    "failed to request releases",
    "failed to deserialize releases as json",
    "failed to check for updates",
    "update endpoint did not respond with a successful status code",
    "update-desktop-database",
    "Failed to initialize gtk backend",
];

/// Substrings identifying a "WebView2 unavailable" failure: the runtime is
/// missing, or the webview could not be created. Both are broken/missing-runtime
/// or OS-level conditions on the user's machine (insufficient quota, access
/// denied, ...), not app bugs. The OS reports them in the user's system language
/// with varying HRESULT codes, so default message-based grouping fragments one
/// root cause across many issues. Rather than drop them (they explain why the
/// app won't start), they are kept but consolidated under one fingerprint.
const WEBVIEW_UNAVAILABLE_SIGNATURES: &[&str] =
    &["failed to create webview", "Could not find the webview runtime"];

/// Stable fingerprint collapsing every [`WEBVIEW_UNAVAILABLE_SIGNATURES`]
/// variant into a single Sentry issue.
const WEBVIEW_UNAVAILABLE_FINGERPRINT: &[std::borrow::Cow<'static, str>] =
    &[std::borrow::Cow::Borrowed("webview-unavailable")];

/// Filters and rewrites an event on its way to Sentry. Returns `None` to drop
/// the event, or `Some(event)` to send it (possibly with an adjusted
/// fingerprint). Intended to be used directly as the client's `before_send`.
pub fn before_send(mut event: Event<'static>) -> Option<Event<'static>> {
    if event_matches(&event, NON_ACTIONABLE_NOISE_SIGNATURES) {
        return None;
    }
    if event_matches(&event, WEBVIEW_UNAVAILABLE_SIGNATURES) {
        event.fingerprint = std::borrow::Cow::Borrowed(WEBVIEW_UNAVAILABLE_FINGERPRINT);
    }
    Some(event)
}

/// Returns `true` if any of `signatures` appears anywhere in the event. The
/// event is serialized to JSON so the match is robust regardless of which field
/// (message, log entry, or exception value) carries the error text.
fn event_matches(event: &Event, signatures: &[&str]) -> bool {
    match serde_json::to_string(event) {
        Ok(serialized) => signatures.iter().any(|sig| serialized.contains(sig)),
        Err(_) => false,
    }
}
