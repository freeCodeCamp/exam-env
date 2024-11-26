use tauri_plugin_http::reqwest;

use crate::{
    error::{Error, PassToSentry},
    secret,
};

const FREECODECAMP_API: &str = dotenvy_macro::dotenv!("VITE_FREECODECAMP_API");

pub async fn post_screenshot(image: Vec<u8>) -> Result<(), Error> {
    if dotenvy_macro::dotenv!("VITE_MOCK_DATA") == "true" {
        return Ok(());
    }

    let client = reqwest::Client::new();
    let post = client.post(format!("{FREECODECAMP_API}/exam-environment/screenshot"));

    if let Some(authorization_token) = secret::get_authorization_token() {
        let img_part = reqwest::multipart::Part::bytes(image)
            .file_name("screenshot.jpg")
            .mime_str("image/jpeg")
            .map_err(|e| Error::RequestError(format!("Unable to create image part: {}", e)))?;

        let form = reqwest::multipart::Form::new().part("file", img_part);

        let res = post
            .header("Exam-Environment-Authorization-Token", authorization_token)
            .multipart(form)
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
