// state.rs
// WHY a global state? Because SQLx's SqlitePool is expensive to create.
// We create it ONCE at startup and share it across all Tauri commands via State<T>.
// WHY Mutex for user_session? Because Tauri commands run concurrently (async),
// and session state must be mutated safely.

use crate::db::models::User;
use sqlx::SqlitePool;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::RwLock;

// The active user session — None means not logged in
#[derive(Debug, Clone)]
pub struct UserSession {
    pub user: User,
    pub access_token: String,
}

// Global application state — injected into every Tauri command via tauri::State
pub struct AppState {
    // The database connection pool
    // Arc makes it cheaply cloneable across threads
    pub db: SqlitePool,

    // The current logged-in user session
    // RwLock allows multiple concurrent reads but exclusive writes
    // This is correct because reads (fetching data) are far more frequent than writes (login/logout)
    pub session: Arc<RwLock<Option<UserSession>>>,

    // Application data directory (platform-specific)
    // e.g., ~/.local/share/vault-app/ on Linux
    //        ~/Library/Application Support/vault-app/ on macOS
    //        %APPDATA%/vault-app/ on Windows
    pub data_dir: std::path::PathBuf,

    // Media storage directory (inside data_dir)
    pub media_dir: std::path::PathBuf,
}

impl AppState {
    pub async fn new(app_handle: &tauri::AppHandle) -> Result<Self, crate::errors::VaultError> {
        // Resolve the platform data directory via Tauri's path API
        let data_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|e| crate::errors::VaultError::Internal(e.to_string()))?;

        let media_dir = data_dir.join("media");

        // Create directories if they don't exist
        tokio::fs::create_dir_all(&data_dir).await?;
        tokio::fs::create_dir_all(&media_dir).await?;

        let db_path = data_dir.join("vault.db");
        let db_url = format!("sqlite://{}?mode=rwc", db_path.display());

        // Create the SQLite connection pool
        // max_connections(5) for SQLite — SQLite is not designed for high concurrency
        // For a desktop app, 1-5 connections is correct
        let pool = sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .map_err(crate::errors::VaultError::Database)?;

        // Set SQLite PRAGMAs for performance and safety
        sqlx::query("PRAGMA journal_mode = WAL")
            .execute(&pool)
            .await?;
        sqlx::query("PRAGMA foreign_keys = ON")
            .execute(&pool)
            .await?;
        sqlx::query("PRAGMA synchronous = NORMAL")
            .execute(&pool)
            .await?;
        sqlx::query("PRAGMA cache_size = -64000") // 64MB page cache
            .execute(&pool)
            .await?;
        sqlx::query("PRAGMA temp_store = MEMORY")
            .execute(&pool)
            .await?;

        // Run all pending migrations
        sqlx::migrate!("./src/db/migrations")
            .run(&pool)
            .await
            .map_err(|e| crate::errors::VaultError::Database(e.into()))?;

        Ok(AppState {
            db: pool,
            session: Arc::new(RwLock::new(None)),
            data_dir,
            media_dir,
        })
    }
}
