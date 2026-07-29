//! Sentry `before_send` event filtering.
//!
//! Keeps non-actionable noise out of Sentry and consolidates fragmented issues
//! before events are sent. Wired up via [`crate::sentry_filter::before_send`] in
//! the client's `ClientOptions`.

use sentry::protocol::{Context, Event};

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
const WEBVIEW_UNAVAILABLE_SIGNATURES: &[&str] = &[
    "failed to create webview",
    "Could not find the webview runtime",
    // Same root cause reported without the "failed to create webview" prefix
    // (e.g. HRESULT 0x8007139F "not in the correct state").
    "WebView2 error: WindowsError",
];

/// Stable fingerprint collapsing every [`WEBVIEW_UNAVAILABLE_SIGNATURES`]
/// variant into a single Sentry issue.
const WEBVIEW_UNAVAILABLE_FINGERPRINT: &[std::borrow::Cow<'static, str>] =
    &[std::borrow::Cow::Borrowed("webview-unavailable")];

/// Filters and rewrites an event on its way to Sentry. Returns `None` to drop
/// the event, or `Some(event)` to send it - adjusting the fingerprint as needed.
pub fn before_send(mut event: Event<'static>) -> Option<Event<'static>> {
    if event_matches(&event, NON_ACTIONABLE_NOISE_SIGNATURES) {
        tracing::warn!(error = ?event, "dropping non-actionable Sentry event");
        return None;
    }
    if event_matches(&event, WEBVIEW_UNAVAILABLE_SIGNATURES) {
        event.fingerprint = std::borrow::Cow::Borrowed(WEBVIEW_UNAVAILABLE_FINGERPRINT);
    }
    enrich(&mut event);
    Some(event)
}

/// Attaches the user and the frontend's session replay to an event.
///
/// Done here rather than on a scope because Sentry's Rust scopes are per-thread
/// while commands run on arbitrary runtime worker threads. This way every event
/// carries the context regardless of how it was captured - explicitly via
/// `PassToSentry::capture`, or by the tracing layer from a `tracing::error!`.
fn enrich(event: &mut Event<'static>) {
    if event.user.is_none()
        && let Some(id) = crate::error::sentry_user_id()
    {
        event.user = Some(sentry::User {
            id: Some(id),
            ..Default::default()
        });
    }

    if let Some(replay_id) = crate::error::replay_id() {
        // `contexts.replay.replay_id` is how Sentry links an event to a replay,
        // so the recording of the session that hit a backend error is reachable
        // from the issue it produced.
        let mut context = std::collections::BTreeMap::new();
        context.insert("replay_id".to_string(), replay_id.into());
        event
            .contexts
            .insert("replay".to_string(), Context::Other(context));
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    fn event_with_message(message: &str) -> Event<'static> {
        Event {
            message: Some(message.to_string()),
            ..Default::default()
        }
    }

    #[test]
    fn drops_non_actionable_noise() {
        let event = event_with_message(
            "failed to check for updates: error sending request for url (https://example.com)",
        );
        assert!(before_send(event).is_none());
    }

    #[test]
    fn consolidates_webview_creation_failure() {
        let event = event_with_message(
            "failed to create webview: WebView2 error: WindowsError(Error { code: HRESULT(0x80070057), message: \"The parameter is incorrect.\" })",
        );
        let sent = before_send(event).expect("event should be kept");
        assert_eq!(*sent.fingerprint, *WEBVIEW_UNAVAILABLE_FINGERPRINT);
    }

    #[test]
    fn consolidates_bare_webview2_error() {
        let event = event_with_message(
            "WebView2 error: WindowsError(Error { code: HRESULT(0x8007139F), message: \"The group or resource is not in the correct state to perform the requested operation.\" })",
        );
        let sent = before_send(event).expect("event should be kept");
        assert_eq!(*sent.fingerprint, *WEBVIEW_UNAVAILABLE_FINGERPRINT);
    }

    #[test]
    fn keeps_unrelated_events_untouched() {
        let event = event_with_message("Credential: something else went wrong");
        let sent = before_send(event).expect("event should be kept");
        assert_ne!(*sent.fingerprint, *WEBVIEW_UNAVAILABLE_FINGERPRINT);
    }
}
