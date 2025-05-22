use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct AppConfig {
    /// The freecodecamp.org authorization token encoded
    pub authorization_token: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub enum AppStore {
    Microsoft,
    Apple,
    GitHub,
    Unknown,
}

typify::import_types!(schema = "../prisma/json-schema.json");

#[derive(Deserialize)]
struct Exams {
    #[serde(rename = "exams")]
    _exams: Vec<EnvExam>,
}

#[cfg(test)]
mod tests {
    use super::{EnvExamAttempt, EnvGeneratedExam, Exams};

    #[test]
    fn exam_serializes() {
        let file = get_file("mocks/exams.json");
        let _: Exams = serde_json::from_str(&file).unwrap();
    }

    #[test]
    fn generated_exam_serializes() {
        let file = get_file("generated-exams.json");
        let _: Vec<EnvGeneratedExam> = serde_json::from_str(&file).unwrap();
    }

    #[test]
    fn exam_attempt_serializes() {
        let file = get_file("exam-attempt.json");
        let _: EnvExamAttempt = serde_json::from_str(&file).unwrap();
    }

    fn get_file(file_name: &str) -> String {
        let path = std::path::PathBuf::from("../public").join(file_name);
        let file = std::fs::read_to_string(path).unwrap();
        file
    }
}
