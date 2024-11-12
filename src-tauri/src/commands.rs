use base64::{prelude::BASE64_STANDARD, Engine};
use screenshots::Screen;
use tauri::{AppHandle, Window};

use crate::{
    error::{Error, PassToSentry},
    request::post_screenshot,
    secret, utils,
};

#[tauri::command]
pub async fn take_screenshot(window: Window) -> Result<(), Error> {
    // Content protect prevents screenshots of the application window. So, for the short duration of the screenshots, it needs disabled.
    window
        .set_content_protected(false)
        .map_err(|e| {
            Error::ScreenshotError(format!(
                "Unable to set window to unprotected mode before screenshot: {}",
                e
            ))
        })
        .capture()?;

    let screens = Screen::all()
        .map_err(|e| Error::ScreenshotError(format!("Unable to return all screens: {}", e)))
        .capture()?;

    if let Some(main_screen) = screens.iter().find(|s| s.display_info.is_primary) {
        let main_screen_img = main_screen
            .capture()
            .map_err(|e| Error::ScreenshotError(format!("Unable to capture screen: {}", e)))
            .capture()?;

        // Inability to set window to content_protected == true should not prevent continuation
        let _window_protected = window
            .set_content_protected(true)
            .map_err(|e| {
                Error::ScreenshotError(format!(
                    "Unable to set window back to protected mode after screenshot: {}",
                    e
                ))
            })
            .capture();

        println!(
            "Image from monitor {:?}, of size {:?} bytes captured.",
            main_screen.display_info.id,
            main_screen_img.len()
        );
        let image = BASE64_STANDARD.encode(utils::image_to_bytes(main_screen_img));
        post_screenshot(image).await?;
    } else {
        return Err(Error::ScreenshotError(
            "No main screen found to take screenshot".to_string(),
        ));
    }

    Ok(())
}

#[tauri::command]
pub fn get_authorization_token() -> Option<String> {
    secret::get_authorization_token()
}

/// Sets the Exam Environment Authorization Token, after ensuring it is valid
#[tauri::command]
pub fn set_authorization_token(new_authorization_token: String) -> Result<(), Error> {
    secret::set_authorization_token(&new_authorization_token)
}

#[tauri::command]
pub fn remove_authorization_token() -> Result<(), Error> {
    secret::remove_authorization_token()
}

#[tauri::command]
pub fn restart_app(app: AppHandle) {
    app.restart()
}
