use screenshots::image::{codecs::jpeg::JpegEncoder, ColorType, ImageBuffer, ImageEncoder, Rgba};
use sentry::types::Dsn;

pub fn image_to_bytes(img: ImageBuffer<Rgba<u8>, Vec<u8>>) -> Vec<u8> {
    let mut image_buf = vec![];
    JpegEncoder::new(&mut image_buf)
        .write_image(&img, img.width(), img.height(), ColorType::Rgba8)
        .unwrap();
    image_buf
}

pub fn valid_sentry_dsn(url: &str) -> bool {
    match url.parse::<Dsn>() {
        Ok(_) => true,
        Err(_) => false,
    }
}
