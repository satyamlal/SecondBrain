use crate::services::categorizer;

#[tauri::command]
pub fn greet(name: String) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn categorize_url(url: String) -> categorizer::CategorizationResult {
    categorizer::categorize_url(&url)
}
