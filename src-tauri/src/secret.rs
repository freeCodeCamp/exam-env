use keyring::Entry;

use crate::error::{Error, PassToSentry};

pub const EXAM_ENVIRONMENT_AUTHORIZATION_TOKEN_HANDLE: &'static str =
    "exam_environment_authorization_token";

pub fn get_authorization_token() -> Option<String> {
    let entry = get_entry();
    entry.get_password().ok()
}

pub fn set_authorization_token(new_token: &str) -> Result<(), Error> {
    let entry = get_entry();

    entry
        .set_password(new_token)
        .map_err(|e| Error::CredentialError(e.to_string()))
        .capture()?;

    Ok(())
}

pub fn remove_authorization_token() -> Result<(), Error> {
    let entry = get_entry();
    entry
        .delete_credential()
        .map_err(|e| Error::CredentialError(e.to_string()))
        .capture()?;

    Ok(())
}

/// NOTE: This function can error if the `service` or `user` arguments passed to `Entry::new` are too long
///
/// SAFETY: As the arguments are hard-coded, the risk should be caught during development.
fn get_entry() -> Entry {
    let service = match std::env::var_os("TAURI_ENV_DEBUG") {
        Some(s) if s == "true" => "development",
        _ => "production",
    };

    let entry = Entry::new(service, EXAM_ENVIRONMENT_AUTHORIZATION_TOKEN_HANDLE);
    entry.expect("entry builder to passably validate service and user arguments")
}

#[cfg(test)]
mod tests {
    use super::get_entry;

    #[test]
    fn keyring_entry_is_constructable() {
        let _ = get_entry();
    }
}
