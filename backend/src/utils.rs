use base64::Engine;
use sentry::types::Dsn;

// pub static FREECODECAMP_API: &'static str = dotenvy_macro::dotenv!("FREECODECAMP_API");
pub static ENVIRONMENT: &'static str = dotenvy_macro::dotenv!("ENVIRONMENT");

pub fn valid_sentry_dsn(url: &str) -> bool {
    url.parse::<Dsn>().is_ok()
}

/// No signature verification: the token is only used as an identifier here,
/// never as proof of authorization.
pub fn token_user_id(authorization_token: &str) -> Option<String> {
    let payload = authorization_token.split('.').nth(1)?;
    let bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(payload)
        .ok()?;
    let json: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
    json.get("examEnvironmentAuthorizationToken")?
        .as_str()
        .map(str::to_owned)
}

#[cfg(test)]
mod tests {
    use base64::Engine;

    use super::token_user_id;

    #[test]
    fn token_user_id_extracts_inner_id() {
        let payload = base64::engine::general_purpose::URL_SAFE_NO_PAD
            .encode(r#"{"examEnvironmentAuthorizationToken":"6a4fba68f83f2726aa3ae516"}"#);
        let jwt = format!("header.{payload}.signature");
        assert_eq!(
            token_user_id(&jwt),
            Some("6a4fba68f83f2726aa3ae516".to_string())
        );
    }

    #[test]
    fn token_user_id_rejects_non_jwt() {
        assert_eq!(token_user_id("not-a-jwt"), None);
        assert_eq!(token_user_id("a.%%%.c"), None);
    }
}
