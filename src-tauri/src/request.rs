use tauri_plugin_http::reqwest;

use crate::{
    error::{Error, PassToSentry},
    secret,
};

const FREECODECAMP_API: &str = dotenvy_macro::dotenv!("VITE_FREECODECAMP_API");

pub async fn post_screenshot(image: String) -> Result<(), Error> {
    if dotenvy_macro::dotenv!("VITE_MOCK_DATA") == "true" {
        return Ok(());
    }

    let client = reqwest::Client::new();
    let post = client.post(format!("{FREECODECAMP_API}/exam-environment/screenshot"));

    if let Some(authorization_token) = secret::get_authorization_token() {
        let res = post
            .header("Exam-Environment-Authorization-Token", authorization_token)
            .body(image)
            .send()
            .await
            .map_err(|e| Error::Request(format!("Request failed to send images: {}", e)))
            .capture()?;

        println!("Response: {:?}", res);
    } else {
        return Err(Error::Credential(
            "Exam Environment Authorization Token is not set".to_string(),
        ));
    }

    Ok(())
}
