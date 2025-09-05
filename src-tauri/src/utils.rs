use sentry::types::Dsn;

// pub static FREECODECAMP_API: &'static str = dotenvy_macro::dotenv!("FREECODECAMP_API");
pub static ENVIRONMENT: &'static str = dotenvy_macro::dotenv!("ENVIRONMENT");

pub fn valid_sentry_dsn(url: &str) -> bool {
    url.parse::<Dsn>().is_ok()
}
