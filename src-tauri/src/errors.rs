// errors.rs
// WHY thiserror? Because it generates Display and From impls automatically.
// WHY not anyhow everywhere? Because Tauri commands return serialized errors to the frontend.
// The frontend needs structured errors, not a Box<dyn Error> wall of text.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum VaultError {
    // Database errors
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    // IO / File system errors
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    // Serialization errors
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    // HTTP / Network errors
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    // URL parsing errors
    #[error("Invalid URL: {0}")]
    InvalidUrl(#[from] url::ParseError),

    // Authentication errors
    #[error("Authentication failed: {message}")]
    AuthFailed { message: String },

    // Authorization errors — user trying to access another user's data
    #[error("Access denied")]
    AccessDenied,

    // Not found
    #[error("Resource not found: {resource}")]
    NotFound { resource: String },

    // Validation errors
    #[error("Validation failed: {field} — {message}")]
    Validation { field: String, message: String },

    // File size limit exceeded
    #[error("File too large: {size_mb}MB exceeds limit of {limit_mb}MB")]
    FileTooLarge { size_mb: u64, limit_mb: u64 },

    // Unsupported media type
    #[error("Unsupported media type: {mime_type}")]
    UnsupportedMediaType { mime_type: String },

    // Keyring / secure storage errors
    #[error("Secure storage error: {0}")]
    SecureStorage(String),

    // Generic internal errors (use sparingly)
    #[error("Internal error: {0}")]
    Internal(String),
}

// CRITICAL: Tauri commands must return Results where the Err type implements
// serde::Serialize. VaultError must be serializable to be sent to the frontend.
impl serde::Serialize for VaultError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

// Type alias used across all command handlers
pub type VaultResult<T> = Result<T, VaultError>;
