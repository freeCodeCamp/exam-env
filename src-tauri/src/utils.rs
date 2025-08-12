use sentry::types::Dsn;

pub static VITE_FREECODECAMP_API: &'static str = dotenvy_macro::dotenv!("VITE_FREECODECAMP_API");

pub fn valid_sentry_dsn(url: &str) -> bool {
    url.parse::<Dsn>().is_ok()
}
