use keyring::Entry;

use crate::{
    error::{Error, ErrorKind, PassToSentry},
    utils::ENVIRONMENT,
};

pub const EXAM_ENVIRONMENT_AUTHORIZATION_TOKEN_HANDLE: &str =
    "exam_environment_authorization_token";

const SET_TOKEN_FAILURE: &str = "Failed to set authorization token";

/// Shown instead of [`SET_TOKEN_FAILURE`] when Windows reports the credential
/// store is full: without the remedy the user cannot get past login, and the
/// generic message left them retrying the same failing write.
#[cfg(target_os = "windows")]
const CREDENTIAL_STORE_FULL: &str = "Windows cannot save the login because Credential Manager is full. Open Credential Manager, select Windows Credentials, remove Generic Credentials you no longer need, then sign in again.";

pub fn get_authorization_token() -> Option<String> {
    let entry = get_entry();
    entry.get_password().ok()
}

pub fn set_authorization_token(new_token: &str) -> Result<(), Error> {
    let entry = get_entry();

    entry
        .set_password(new_token)
        .map_err(|e| {
            Error::new(
                ErrorKind::Credential,
                e.to_string(),
                set_token_user_message(&e),
            )
        })
        .capture()?;

    Ok(())
}

/// `ERROR_NOT_ENOUGH_MEMORY`. `CredWriteW` returns it when the user's credential
/// store cannot take another entry - not when the machine is out of memory, and
/// not because this token is too large (`keyring` rejects an oversized secret as
/// `TooLong` before it reaches the platform).
#[cfg(target_os = "windows")]
const ERROR_NOT_ENOUGH_MEMORY: u32 = 8;

/// The message to show the user for a failed write. `keyring` has no name for
/// most Windows error codes, so an unmapped failure reaches Sentry (and would
/// reach the user) as a bare "Windows error code {n}".
#[cfg(target_os = "windows")]
fn set_token_user_message(e: &keyring::Error) -> &'static str {
    let keyring::Error::PlatformFailure(platform) = e else {
        return SET_TOKEN_FAILURE;
    };

    match platform.as_ref().downcast_ref::<keyring::windows::Error>() {
        Some(keyring::windows::Error(ERROR_NOT_ENOUGH_MEMORY)) => CREDENTIAL_STORE_FULL,
        _ => SET_TOKEN_FAILURE,
    }
}

#[cfg(not(target_os = "windows"))]
fn set_token_user_message(_e: &keyring::Error) -> &'static str {
    SET_TOKEN_FAILURE
}

pub fn remove_authorization_token() -> Result<(), Error> {
    let entry = get_entry();
    match entry.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(Error::new(
            ErrorKind::Credential,
            e.to_string(),
            "Failed to remove authorization token",
        ))
        .capture(),
    }
}

/// NOTE: This function can error if the `service` or `user` arguments passed to `Entry::new` are too long
///
/// SAFETY: As the arguments are hard-coded, the risk should be caught during development.
fn get_entry() -> Entry {
    let entry = Entry::new(ENVIRONMENT, EXAM_ENVIRONMENT_AUTHORIZATION_TOKEN_HANDLE);
    entry.expect("entry builder to passably validate service and user arguments")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keyring_entry_is_constructable() {
        let _ = get_entry();
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn full_credential_store_gets_a_remedy() {
        let e = keyring::Error::PlatformFailure(Box::new(keyring::windows::Error(
            ERROR_NOT_ENOUGH_MEMORY,
        )));
        assert_eq!(set_token_user_message(&e), CREDENTIAL_STORE_FULL);
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn other_platform_failures_keep_the_generic_message() {
        // ERROR_INVALID_PARAMETER: a different `PlatformFailure` code.
        let e = keyring::Error::PlatformFailure(Box::new(keyring::windows::Error(87)));
        assert_eq!(set_token_user_message(&e), SET_TOKEN_FAILURE);

        assert_eq!(
            set_token_user_message(&keyring::Error::NoEntry),
            SET_TOKEN_FAILURE
        );
    }
}
