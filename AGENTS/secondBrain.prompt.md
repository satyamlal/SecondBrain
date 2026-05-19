# PRODUCTION-GRADE AI BUILD PROMPT
## Rust + Tauri Desktop Application — "Vault" (Personal Knowledge Manager)
### Intended For: GitHub Copilot / Codex / Kimi 2.6 / Any Agentic AI Coding System
### Document Version: 1.0.0 | Approach: First Principles + Test-Driven Development

---

> **MANDATORY READING FOR AI BEFORE WRITING A SINGLE LINE OF CODE.**
>
> This is not a vague feature list. This is a structured, phased engineering specification.
> You are expected to follow it sequentially, phase by phase.
> Do NOT skip phases. Do NOT assume. Do NOT hallucinate package APIs.
> Verify every crate, every npm package, every API endpoint before using it.
> If you are unsure about a version or an API — STOP and check docs.rs, crates.io, or npmjs.com first.

---

## SECTION 0 — FIRST PRINCIPLES THINKING (READ THIS FULLY)

Before you write any code, you must understand **why** this app exists and **what problems it solves at the lowest level**.

### What is this application, fundamentally?

Strip away all UI and features. At its core, this is:

1. **A local-first structured data store** — The user creates "items" (links, media, notes, mindmaps). All data must be persisted safely on disk.
2. **A categorization engine** — When a link is saved, the system must determine what kind of link it is (YouTube, Instagram, Reddit, etc.) by analyzing its domain/URL pattern. This is deterministic pattern matching, not AI guesswork.
3. **A multi-media file manager** — The app must accept image and video files, store them, and associate them with other items.
4. **A multi-user authentication gateway** — Multiple people can use this app. Each user's data is isolated. Authentication is done via Google OAuth2.
5. **A mindmap builder** — A structured graph-like data entity (nodes + edges) that can be created, edited, and visualized.
6. **A cross-platform native desktop app** — It must work on Windows, macOS, and Linux using Tauri (Rust backend + Web frontend).

### The Fundamental Architecture Contract

```
[User's Gmail OAuth2] → [App Auth Layer]
         ↓
[User Session]
         ↓
[Tauri Frontend (React + TypeScript)] ← IPC bridge → [Rust Backend (Tauri Commands)]
                                                              ↓
                                                    [SQLite via SQLx (local DB)]
                                                    [File System (media storage)]
                                                    [URL Categorizer (pure Rust)]
```

Everything flows through this contract. No component breaks this boundary.
The Rust backend owns ALL data logic. The frontend owns ONLY display and user interaction.
The frontend NEVER directly touches the database or the file system.

---

## SECTION 1 — ENVIRONMENT VERIFICATION (MANDATORY FIRST STEP)

**RULE: Before scaffolding the project, run ALL of the following commands and report their output.
If any tool is missing or below the minimum version, STOP and provide installation instructions.
Do NOT proceed until all checks pass.**

### 1.1 — System Check Commands

Run each command exactly as written. Capture the output.

```bash
# --- Rust Toolchain ---
rustup --version
# MINIMUM REQUIRED: rustup 1.27.0 or higher

rustc --version
# MINIMUM REQUIRED: rustc 1.78.0 or higher (stable channel)

cargo --version
# MINIMUM REQUIRED: cargo 1.78.0 or higher

rustup show
# Verify that the 'stable' toolchain is active and set as default

# --- Node.js and npm ---
node --version
# MINIMUM REQUIRED: Node.js v20.x LTS (Iron) or v22.x LTS (Jod)
# DO NOT use v21.x or any odd-numbered version — those are NOT LTS

npm --version
# MINIMUM REQUIRED: npm 10.x or higher (ships with Node 20 LTS)

# --- Tauri CLI ---
cargo tauri --version
# OR if installed via npm:
npx tauri --version
# MINIMUM REQUIRED: Tauri CLI v2.x

# --- System Dependencies (Platform Specific) ---

# On Ubuntu/Debian Linux:
dpkg -l | grep -E "libwebkit2gtk|libssl|libgtk|libayatana"
# Required packages: libwebkit2gtk-4.1-dev, libssl-dev, libgtk-3-dev, libayatana-appindicator3-dev

# On macOS:
xcode-select --version
# Required: Xcode Command Line Tools installed

# On Windows:
# Ensure Microsoft Visual Studio C++ Build Tools are installed
# Run from PowerShell:
Get-Command cl.exe -ErrorAction SilentlyContinue

# --- SQLite ---
sqlite3 --version
# MINIMUM REQUIRED: 3.39.0 or higher

# --- Git ---
git --version
# MINIMUM REQUIRED: 2.x or higher
```

### 1.2 — Version Lock Table

These are the PINNED versions you will use. Do NOT use any other version unless stated.

| Tool / Crate / Package      | Pinned Version       | Source                    |
|-----------------------------|----------------------|---------------------------|
| Rust (stable channel)       | 1.78.0+              | `rustup default stable`   |
| Tauri                       | 2.x (latest stable)  | crates.io                 |
| tauri-build                 | 2.x (latest stable)  | crates.io                 |
| SQLx                        | 0.8.x                | crates.io                 |
| serde                       | 1.x                  | crates.io                 |
| serde_json                  | 1.x                  | crates.io                 |
| tokio                       | 1.x (full features)  | crates.io                 |
| uuid                        | 1.x (v4 feature)     | crates.io                 |
| chrono                      | 0.4.x                | crates.io                 |
| oauth2                      | 4.x                  | crates.io                 |
| reqwest                     | 0.12.x               | crates.io                 |
| url                         | 2.x                  | crates.io                 |
| regex                       | 1.x                  | crates.io                 |
| anyhow                      | 1.x                  | crates.io                 |
| thiserror                   | 1.x                  | crates.io                 |
| Node.js                     | 20.x LTS             | nodejs.org                |
| React                       | 18.x                 | npmjs.com                 |
| TypeScript                  | 5.x                  | npmjs.com                 |
| Vite                        | 5.x                  | npmjs.com                 |
| @tauri-apps/api             | 2.x                  | npmjs.com                 |
| @tauri-apps/plugin-shell    | 2.x                  | npmjs.com                 |
| Reactflow (mindmap)         | 11.x                 | npmjs.com                 |
| TanStack Query              | 5.x                  | npmjs.com                 |
| Zustand                     | 4.x                  | npmjs.com                 |
| Tailwind CSS                | 3.x                  | npmjs.com                 |

**After running all checks, output a summary table showing: Tool | Expected Version | Actual Version | PASS/FAIL**

---

## SECTION 2 — PROJECT SCAFFOLDING

### 2.1 — Initialize the Tauri + React + TypeScript Project

```bash
# Step 1: Create the Tauri project using the official CLI
# This scaffolds both the Rust backend (src-tauri/) and frontend (src/)
npm create tauri-app@latest vault-app -- --template react-ts

# Step 2: Navigate into the project
cd vault-app

# Step 3: Install all frontend dependencies
npm install

# Step 4: Verify the project structure is correct
ls -la
# You must see: src-tauri/ | src/ | package.json | tsconfig.json | vite.config.ts
```

### 2.2 — Expected Project Structure (Final State)

The AI must build toward this exact directory structure. Do not deviate.

```
vault-app/
├── src-tauri/                    # Rust backend — owned by Tauri
│   ├── Cargo.toml                # Rust dependencies (pinned versions)
│   ├── Cargo.lock                # Lock file — MUST be committed to git
│   ├── build.rs                  # Tauri build script
│   ├── tauri.conf.json           # Tauri app config
│   ├── capabilities/             # Tauri v2 permission system
│   │   └── default.json
│   ├── icons/                    # App icons for all platforms
│   └── src/
│       ├── main.rs               # Tauri app entry point
│       ├── lib.rs                # Library root — exposes modules
│       ├── commands/             # All Tauri IPC command handlers
│       │   ├── mod.rs
│       │   ├── auth.rs           # Gmail OAuth2 commands
│       │   ├── links.rs          # Link save/fetch/delete commands
│       │   ├── media.rs          # Image/video upload commands
│       │   ├── notes.rs          # Note CRUD commands
│       │   └── mindmap.rs        # Mindmap CRUD commands
│       ├── db/                   # Database layer
│       │   ├── mod.rs
│       │   ├── migrations/       # SQLx migration SQL files
│       │   │   ├── 001_initial_schema.sql
│       │   │   ├── 002_add_tags.sql
│       │   │   └── 003_add_mindmaps.sql
│       │   └── models.rs         # Rust structs mapping to DB rows
│       ├── services/             # Business logic layer
│       │   ├── mod.rs
│       │   ├── categorizer.rs    # URL pattern categorization engine
│       │   ├── auth_service.rs   # OAuth2 token management
│       │   └── media_service.rs  # File system media management
│       ├── errors.rs             # Centralized error types (thiserror)
│       └── state.rs              # Global app state (DB pool, user session)
│
├── src/                          # React frontend
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component + routing
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── links/
│   │   │   ├── LinkCard.tsx
│   │   │   ├── LinkGrid.tsx
│   │   │   └── SaveLinkModal.tsx
│   │   ├── media/
│   │   │   ├── MediaCard.tsx
│   │   │   └── MediaUploader.tsx
│   │   ├── notes/
│   │   │   ├── NoteCard.tsx
│   │   │   └── NoteEditor.tsx
│   │   └── mindmap/
│   │       ├── MindmapCanvas.tsx
│   │       └── MindmapNode.tsx
│   ├── store/                    # Zustand global state
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── hooks/                    # TanStack Query hooks
│   │   ├── useLinks.ts
│   │   ├── useMedia.ts
│   │   ├── useNotes.ts
│   │   └── useMindmaps.ts
│   ├── lib/
│   │   └── tauri.ts              # Typed Tauri command wrappers
│   └── types/
│       └── index.ts              # Shared TypeScript types
│
├── tests/                        # Integration test suite
│   ├── rust/                     # Rust unit/integration tests
│   └── e2e/                      # End-to-end tests
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.example                  # Environment variable template
```

---

## SECTION 3 — DATABASE DESIGN (RUST + SQLX + SQLITE)

### 3.1 — Why SQLite?

SQLite is the correct choice here for the following reasons:
- **Local-first**: The app runs on the user's machine. No server needed.
- **Single-file database**: Easy to backup, easy to locate (`~/.vault/vault.db`).
- **SQLx over Diesel**: SQLx is async-native, compile-time query checked, and has no ORM overhead. We want explicit SQL, not magic.
- **No network**: No MongoDB, no Firebase, no Supabase. This is a desktop app.

### 3.2 — Migration Files (Write these first, before any Rust code)

**File: `src-tauri/src/db/migrations/001_initial_schema.sql`**

```sql
-- PRAGMA settings — set at connection time, not in migration
-- These are applied in state.rs when the pool is created

-- Users Table
-- Each Google account = one user row
-- google_id is the unique identifier from Google's OAuth2 response ("sub" field)
CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,          -- UUID v4, generated by Rust
    google_id   TEXT NOT NULL UNIQUE,      -- Google OAuth2 "sub" claim
    email       TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    avatar_url  TEXT,
    created_at  TEXT NOT NULL,             -- ISO 8601 UTC timestamp
    updated_at  TEXT NOT NULL
);

-- OAuth Tokens Table
-- Stores access + refresh tokens per user
-- Tokens are sensitive — encrypt at rest (see Section 6)
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token    TEXT NOT NULL,
    refresh_token   TEXT,
    token_type      TEXT NOT NULL DEFAULT 'Bearer',
    expires_at      TEXT NOT NULL,         -- ISO 8601 UTC
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

-- Links Table
-- Core entity: a saved URL
CREATE TABLE IF NOT EXISTS links (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    title           TEXT,                  -- Auto-fetched or user-provided
    description     TEXT,                  -- Optional note about this link
    category        TEXT NOT NULL,         -- Auto-detected: "youtube", "instagram", etc.
    favicon_url     TEXT,
    is_favorite     INTEGER NOT NULL DEFAULT 0,  -- Boolean (0/1)
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

-- Tags Table
-- Normalized tag store — tags are reusable across items
CREATE TABLE IF NOT EXISTS tags (
    id      TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name    TEXT NOT NULL,
    color   TEXT NOT NULL DEFAULT '#6366f1',  -- Hex color for UI display
    UNIQUE(user_id, name)
);

-- Link Tags Junction Table
-- Many-to-many between links and tags
CREATE TABLE IF NOT EXISTS link_tags (
    link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (link_id, tag_id)
);

-- Media Table
-- Stores images and videos — with OR without an associated link
CREATE TABLE IF NOT EXISTS media (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    link_id         TEXT REFERENCES links(id) ON DELETE SET NULL,  -- Optional association
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,         -- Relative path inside the media storage dir
    file_size       INTEGER NOT NULL,      -- Bytes
    mime_type       TEXT NOT NULL,         -- e.g., "image/jpeg", "video/mp4"
    media_type      TEXT NOT NULL,         -- "image" or "video"
    note            TEXT,                  -- Optional user note about this media
    thumbnail_path  TEXT,                  -- For video thumbnails
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

-- Notes Table
-- Standalone notes — no link, no media required (but can be associated)
CREATE TABLE IF NOT EXISTS notes (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    link_id     TEXT REFERENCES links(id) ON DELETE SET NULL,
    media_id    TEXT REFERENCES media(id) ON DELETE SET NULL,
    title       TEXT,
    content     TEXT NOT NULL,             -- The note body (plain text or markdown)
    is_pinned   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- Mindmaps Table
-- A mindmap is a JSON graph stored as a single blob
-- The frontend (Reactflow) owns the graph format; Rust just stores/retrieves it
CREATE TABLE IF NOT EXISTS mindmaps (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    graph_data  TEXT NOT NULL,             -- JSON blob: {nodes: [...], edges: [...]}
    thumbnail   TEXT,                      -- Base64 PNG snapshot for preview cards
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- Indexes — Always add indexes on foreign keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_link_id ON media(link_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_mindmaps_user_id ON mindmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_link_tags_link_id ON link_tags(link_id);
CREATE INDEX IF NOT EXISTS idx_link_tags_tag_id ON link_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);
```

---

## SECTION 4 — RUST BACKEND IMPLEMENTATION

### 4.1 — Cargo.toml (Pinned Dependencies)

```toml
[package]
name = "vault-app"
version = "0.1.0"
description = "Vault — Personal Knowledge Manager"
authors = ["Vault Dev Team"]
license = "MIT"
repository = ""
edition = "2021"
rust-version = "1.78"

[lib]
name = "vault_app_lib"
crate-type = ["lib", "cdylib", "staticlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = ["protocol-asset"] }
tauri-plugin-shell = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-http = "2"
tauri-plugin-notification = "2"

# Async runtime — ALWAYS use tokio for Tauri async commands
tokio = { version = "1", features = ["full"] }

# Serialization — serde is mandatory for Tauri commands
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# Database — async SQLite with compile-time query checking
sqlx = { version = "0.8", features = ["sqlite", "runtime-tokio", "chrono", "uuid", "migrate"] }

# UUID generation
uuid = { version = "1", features = ["v4", "serde"] }

# Date/Time
chrono = { version = "0.4", features = ["serde"] }

# HTTP client for OAuth2 token exchange and URL metadata fetching
reqwest = { version = "0.12", features = ["json", "rustls-tls"] }

# OAuth2 — Google OAuth2 PKCE flow
oauth2 = "4"

# URL parsing and validation
url = "2"

# Regex for URL categorization
regex = "1"

# Error handling
anyhow = "1"
thiserror = "1"

# Environment variables
dotenvy = "0.15"

# Logging
log = "0.4"
env_logger = "0.11"

# Hashing (for file deduplication)
sha2 = "0.10"
hex = "0.4"

# Base64 (for thumbnail encoding)
base64 = "0.22"

# Keychain/secure storage for tokens
keyring = "3"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

### 4.2 — Error Types (`src-tauri/src/errors.rs`)

**THIS FILE IS WRITTEN FIRST. Every other module depends on it.**
**Why first? Because in Rust, error handling is not an afterthought — it is architecture.**

```rust
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
```

### 4.3 — App State (`src-tauri/src/state.rs`)

```rust
// state.rs
// WHY a global state? Because SQLx's SqlitePool is expensive to create.
// We create it ONCE at startup and share it across all Tauri commands via State<T>.
// WHY Mutex for user_session? Because Tauri commands run concurrently (async),
// and session state must be mutated safely.

use sqlx::SqlitePool;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::db::models::User;

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
        // max_connections(1) for SQLite — SQLite is not designed for high concurrency
        // For a desktop app, 1-5 connections is correct
        let pool = sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .map_err(crate::errors::VaultError::Database)?;

        // Set SQLite PRAGMAs for performance and safety
        sqlx::query("PRAGMA journal_mode = WAL")
            .execute(&pool).await?;
        sqlx::query("PRAGMA foreign_keys = ON")
            .execute(&pool).await?;
        sqlx::query("PRAGMA synchronous = NORMAL")
            .execute(&pool).await?;
        sqlx::query("PRAGMA cache_size = -64000")  // 64MB page cache
            .execute(&pool).await?;
        sqlx::query("PRAGMA temp_store = MEMORY")
            .execute(&pool).await?;

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
```

### 4.4 — URL Categorizer (`src-tauri/src/services/categorizer.rs`)

**This is the automatic tagging engine. It is PURE DETERMINISTIC LOGIC. No AI. No network calls.
It matches URL domains against known patterns using the `url` crate for parsing and `regex` for patterns.**

```rust
// categorizer.rs
// WHY deterministic pattern matching and not an LLM?
// Speed: This runs on every link save. It must be instantaneous (<1ms).
// Correctness: "youtube.com" is always YouTube. You don't need a neural net for this.
// Privacy: No user data leaves the app for categorization.

use url::Url;
use std::collections::HashMap;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum LinkCategory {
    YouTube,
    Instagram,
    Pinterest,
    Reddit,
    Medium,
    Twitter,      // includes x.com
    LinkedIn,
    GitHub,
    StackOverflow,
    TikTok,
    Facebook,
    Twitch,
    Spotify,
    SoundCloud,
    NewsArticle,  // Generic news sites
    Documentation,
    Shopping,
    Other,
}

impl std::fmt::Display for LinkCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Serialize as lowercase strings for DB storage
        match self {
            LinkCategory::YouTube => write!(f, "youtube"),
            LinkCategory::Instagram => write!(f, "instagram"),
            LinkCategory::Pinterest => write!(f, "pinterest"),
            LinkCategory::Reddit => write!(f, "reddit"),
            LinkCategory::Medium => write!(f, "medium"),
            LinkCategory::Twitter => write!(f, "twitter"),
            LinkCategory::LinkedIn => write!(f, "linkedin"),
            LinkCategory::GitHub => write!(f, "github"),
            LinkCategory::StackOverflow => write!(f, "stackoverflow"),
            LinkCategory::TikTok => write!(f, "tiktok"),
            LinkCategory::Facebook => write!(f, "facebook"),
            LinkCategory::Twitch => write!(f, "twitch"),
            LinkCategory::Spotify => write!(f, "spotify"),
            LinkCategory::SoundCloud => write!(f, "soundcloud"),
            LinkCategory::NewsArticle => write!(f, "news"),
            LinkCategory::Documentation => write!(f, "documentation"),
            LinkCategory::Shopping => write!(f, "shopping"),
            LinkCategory::Other => write!(f, "other"),
        }
    }
}

// The categorization result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CategorizationResult {
    pub category: LinkCategory,
    pub auto_tags: Vec<String>,   // e.g., ["video", "social-media", "google"]
    pub category_string: String,  // The Display string for DB storage
}

/// Categorize a URL by analyzing its domain.
/// This function NEVER makes network requests.
/// It is synchronous and O(1) with a HashMap lookup.
pub fn categorize_url(raw_url: &str) -> CategorizationResult {
    let parsed = match Url::parse(raw_url) {
        Ok(u) => u,
        Err(_) => return unknown_result(),
    };

    let host = match parsed.host_str() {
        Some(h) => h.to_lowercase(),
        None => return unknown_result(),
    };

    // Strip "www." prefix for normalized matching
    let domain = host.strip_prefix("www.").unwrap_or(&host);

    let (category, tags) = match_domain(domain, &parsed);

    let category_string = category.to_string();
    CategorizationResult {
        category,
        auto_tags: tags,
        category_string,
    }
}

fn match_domain(domain: &str, url: &Url) -> (LinkCategory, Vec<String>) {
    // Exact domain match first (most reliable)
    match domain {
        "youtube.com" | "youtu.be" | "m.youtube.com" => (
            LinkCategory::YouTube,
            vec!["video".into(), "social-media".into(), "google".into()],
        ),

        "instagram.com" | "instagr.am" => (
            LinkCategory::Instagram,
            vec!["social-media".into(), "photo".into(), "meta".into()],
        ),

        "pinterest.com" | "pin.it" | "pinterest.co.uk" => (
            LinkCategory::Pinterest,
            vec!["visual".into(), "inspiration".into(), "photo".into()],
        ),

        "reddit.com" | "redd.it" | "old.reddit.com" => (
            LinkCategory::Reddit,
            vec!["community".into(), "forum".into(), "social-media".into()],
        ),

        "medium.com" => (
            LinkCategory::Medium,
            vec!["article".into(), "writing".into(), "blog".into()],
        ),

        "twitter.com" | "x.com" | "t.co" => (
            LinkCategory::Twitter,
            vec!["social-media".into(), "microblog".into()],
        ),

        "linkedin.com" | "lnkd.in" => (
            LinkCategory::LinkedIn,
            vec!["professional".into(), "networking".into(), "career".into()],
        ),

        "github.com" | "gist.github.com" => (
            LinkCategory::GitHub,
            vec!["code".into(), "developer".into(), "open-source".into()],
        ),

        "stackoverflow.com" | "stackexchange.com" | "superuser.com" | "serverfault.com" => (
            LinkCategory::StackOverflow,
            vec!["developer".into(), "qa".into(), "technical".into()],
        ),

        "tiktok.com" | "vm.tiktok.com" => (
            LinkCategory::TikTok,
            vec!["video".into(), "social-media".into(), "short-form".into()],
        ),

        "facebook.com" | "fb.com" | "fb.watch" => (
            LinkCategory::Facebook,
            vec!["social-media".into(), "meta".into()],
        ),

        "twitch.tv" | "clips.twitch.tv" => (
            LinkCategory::Twitch,
            vec!["streaming".into(), "gaming".into(), "video".into()],
        ),

        "open.spotify.com" | "spotify.com" => (
            LinkCategory::Spotify,
            vec!["music".into(), "audio".into(), "streaming".into()],
        ),

        "soundcloud.com" => (
            LinkCategory::SoundCloud,
            vec!["music".into(), "audio".into()],
        ),

        // Documentation sites — match by subdomain patterns
        d if d.contains("docs.") || d.ends_with(".docs.io") => (
            LinkCategory::Documentation,
            vec!["documentation".into(), "reference".into()],
        ),

        // Shopping sites
        "amazon.com" | "amazon.in" | "flipkart.com" | "ebay.com"
        | "etsy.com" | "myntra.com" | "meesho.com" => (
            LinkCategory::Shopping,
            vec!["shopping".into(), "ecommerce".into()],
        ),

        // Known news domains
        "bbc.com" | "bbc.co.uk" | "nytimes.com" | "theguardian.com"
        | "reuters.com" | "apnews.com" | "thehindu.com" | "ndtv.com"
        | "timesofindia.indiatimes.com" => (
            LinkCategory::NewsArticle,
            vec!["news".into(), "article".into()],
        ),

        // Fallback
        _ => (LinkCategory::Other, vec!["link".into()]),
    }
}

fn unknown_result() -> CategorizationResult {
    CategorizationResult {
        category: LinkCategory::Other,
        auto_tags: vec!["link".into()],
        category_string: "other".into(),
    }
}

// ============================================================
// TESTS — Run with: cargo test categorizer
// ============================================================
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_youtube_full_url() {
        let result = categorize_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        assert_eq!(result.category, LinkCategory::YouTube);
        assert!(result.auto_tags.contains(&"video".to_string()));
    }

    #[test]
    fn test_youtu_be_short_url() {
        let result = categorize_url("https://youtu.be/dQw4w9WgXcQ");
        assert_eq!(result.category, LinkCategory::YouTube);
    }

    #[test]
    fn test_instagram_post() {
        let result = categorize_url("https://www.instagram.com/p/ABC123/");
        assert_eq!(result.category, LinkCategory::Instagram);
    }

    #[test]
    fn test_reddit_thread() {
        let result = categorize_url("https://old.reddit.com/r/rust/comments/abc/");
        assert_eq!(result.category, LinkCategory::Reddit);
    }

    #[test]
    fn test_x_com_twitter() {
        let result = categorize_url("https://x.com/user/status/123");
        assert_eq!(result.category, LinkCategory::Twitter);
    }

    #[test]
    fn test_github_repo() {
        let result = categorize_url("https://github.com/tauri-apps/tauri");
        assert_eq!(result.category, LinkCategory::GitHub);
        assert!(result.auto_tags.contains(&"code".to_string()));
    }

    #[test]
    fn test_invalid_url_returns_other() {
        let result = categorize_url("not a url at all");
        assert_eq!(result.category, LinkCategory::Other);
    }

    #[test]
    fn test_amazon_india() {
        let result = categorize_url("https://www.amazon.in/dp/B09XYZ");
        assert_eq!(result.category, LinkCategory::Shopping);
    }

    #[test]
    fn test_medium_article() {
        let result = categorize_url("https://medium.com/@user/how-to-rust-abc123");
        assert_eq!(result.category, LinkCategory::Medium);
    }

    #[test]
    fn test_unknown_domain_returns_other() {
        let result = categorize_url("https://some-random-blog-nobody-knows.com/post/1");
        assert_eq!(result.category, LinkCategory::Other);
    }
}
```

### 4.5 — Database Models (`src-tauri/src/db/models.rs`)

```rust
// models.rs
// WHY explicit structs and not a generic HashMap?
// Because sqlx's compile-time checking (`query_as!`) requires concrete types.
// These structs are the single source of truth between the DB schema and Rust code.

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

// -------- User --------
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String,           // UUID as TEXT
    pub google_id: String,
    pub email: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// -------- Link --------
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Link {
    pub id: String,
    pub user_id: String,
    pub url: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub category: String,
    pub favicon_url: Option<String>,
    pub is_favorite: bool,
    pub created_at: String,
    pub updated_at: String,
}

// The payload sent from the frontend to CREATE a link
#[derive(Debug, Deserialize)]
pub struct CreateLinkPayload {
    pub url: String,
    pub title: Option<String>,
    pub description: Option<String>,
}

// The response sent BACK to the frontend after creating/fetching a link
// Includes the auto-generated tags (not stored in the link row itself)
#[derive(Debug, Serialize)]
pub struct LinkWithTags {
    #[serde(flatten)]
    pub link: Link,
    pub tags: Vec<Tag>,
}

// -------- Tag --------
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Tag {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub color: String,
}

// -------- Media --------
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Media {
    pub id: String,
    pub user_id: String,
    pub link_id: Option<String>,
    pub file_name: String,
    pub file_path: String,
    pub file_size: i64,
    pub mime_type: String,
    pub media_type: String,
    pub note: Option<String>,
    pub thumbnail_path: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// -------- Note --------
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Note {
    pub id: String,
    pub user_id: String,
    pub link_id: Option<String>,
    pub media_id: Option<String>,
    pub title: Option<String>,
    pub content: String,
    pub is_pinned: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateNotePayload {
    pub title: Option<String>,
    pub content: String,
    pub link_id: Option<String>,
    pub media_id: Option<String>,
}

// -------- Mindmap --------
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Mindmap {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub graph_data: String,   // JSON string
    pub thumbnail: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct SaveMindmapPayload {
    pub id: Option<String>,       // None = create new, Some = update existing
    pub title: String,
    pub graph_data: String,       // The Reactflow nodes/edges JSON
    pub thumbnail: Option<String>,
}
```

### 4.6 — Tauri Command Handlers

#### Auth Commands (`src-tauri/src/commands/auth.rs`)

```rust
// auth.rs
// The OAuth2 PKCE flow for Google:
// Step 1: Generate a code_verifier (random string) and code_challenge (SHA256 hash of verifier)
// Step 2: Open the system browser to Google's auth URL
// Step 3: Google redirects to a localhost callback server with a code
// Step 4: Exchange the code + verifier for access_token + refresh_token
// Step 5: Use access_token to fetch user profile from Google's userinfo endpoint
// Step 6: Upsert the user in the DB, store tokens in keyring

use tauri::{command, State};
use crate::state::AppState;
use crate::errors::{VaultError, VaultResult};
use crate::db::models::User;

#[derive(serde::Serialize)]
pub struct AuthStatus {
    pub is_authenticated: bool,
    pub user: Option<User>,
}

// Called on app startup — checks if a valid session exists
#[command]
pub async fn get_auth_status(state: State<'_, AppState>) -> VaultResult<AuthStatus> {
    let session = state.session.read().await;
    match &*session {
        Some(s) => Ok(AuthStatus {
            is_authenticated: true,
            user: Some(s.user.clone()),
        }),
        None => Ok(AuthStatus {
            is_authenticated: false,
            user: None,
        }),
    }
}

// Initiates the Google OAuth2 PKCE login flow
// Opens the system browser — Tauri cannot embed a browser for OAuth
#[command]
pub async fn login_with_google(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> VaultResult<User> {
    // Implementation uses oauth2 crate with PKCE
    // Spawns a local HTTP server on 127.0.0.1:PORT to receive the redirect
    // The redirect_uri registered in Google Console MUST match this port
    // Full implementation: see services/auth_service.rs
    todo!("Implement OAuth2 PKCE flow")
}

// Logs out the current user and clears the session
#[command]
pub async fn logout(state: State<'_, AppState>) -> VaultResult<()> {
    let mut session = state.session.write().await;
    *session = None;
    // Also revoke the token via Google's revocation endpoint
    // DELETE token from keyring
    Ok(())
}
```

#### Link Commands (`src-tauri/src/commands/links.rs`)

```rust
// links.rs
use tauri::{command, State};
use crate::state::AppState;
use crate::errors::{VaultError, VaultResult};
use crate::db::models::{Link, LinkWithTags, CreateLinkPayload, Tag};
use crate::services::categorizer::categorize_url;
use uuid::Uuid;
use chrono::Utc;

/// Save a new link for the authenticated user.
/// This command:
/// 1. Validates the URL
/// 2. Categorizes it using the categorizer engine
/// 3. Inserts the link into the DB
/// 4. Upserts auto-generated tags and creates junction rows
/// 5. Returns the full LinkWithTags response
#[command]
pub async fn save_link(
    payload: CreateLinkPayload,
    state: State<'_, AppState>,
) -> VaultResult<LinkWithTags> {
    // Step 1: Verify authentication
    let session = state.session.read().await;
    let user = match &*session {
        Some(s) => s.user.clone(),
        None => return Err(VaultError::AuthFailed {
            message: "Not logged in".to_string()
        }),
    };
    drop(session); // Release the read lock before any await on DB

    // Step 2: Validate URL
    let parsed = url::Url::parse(&payload.url)
        .map_err(|_| VaultError::Validation {
            field: "url".to_string(),
            message: "Invalid URL format".to_string(),
        })?;

    // Step 3: Categorize
    let categorization = categorize_url(&payload.url);

    // Step 4: Insert the link
    let link_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query!(
        r#"
        INSERT INTO links (id, user_id, url, title, description, category, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#,
        link_id,
        user.id,
        payload.url,
        payload.title,
        payload.description,
        categorization.category_string,
        now,
        now,
    )
    .execute(&state.db)
    .await?;

    // Step 5: Upsert tags and create junction rows
    let mut tags = Vec::new();
    for tag_name in &categorization.auto_tags {
        let tag_id = Uuid::new_v4().to_string();

        // INSERT OR IGNORE the tag (it may already exist for this user)
        sqlx::query!(
            r#"
            INSERT OR IGNORE INTO tags (id, user_id, name, color)
            VALUES (?, ?, ?, ?)
            "#,
            tag_id,
            user.id,
            tag_name,
            "#6366f1",
        )
        .execute(&state.db)
        .await?;

        // Fetch the actual tag (whether newly inserted or pre-existing)
        let tag = sqlx::query_as!(
            Tag,
            "SELECT id, user_id, name, color FROM tags WHERE user_id = ? AND name = ?",
            user.id,
            tag_name,
        )
        .fetch_one(&state.db)
        .await?;

        // Create the link-tag junction
        sqlx::query!(
            "INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)",
            link_id,
            tag.id,
        )
        .execute(&state.db)
        .await?;

        tags.push(tag);
    }

    // Step 6: Fetch and return the full link
    let link = sqlx::query_as!(
        Link,
        "SELECT * FROM links WHERE id = ?",
        link_id,
    )
    .fetch_one(&state.db)
    .await?;

    Ok(LinkWithTags { link, tags })
}

/// Fetch all links for the current user, optionally filtered by category
#[command]
pub async fn get_links(
    category: Option<String>,
    state: State<'_, AppState>,
) -> VaultResult<Vec<LinkWithTags>> {
    let session = state.session.read().await;
    let user_id = match &*session {
        Some(s) => s.user.id.clone(),
        None => return Err(VaultError::AuthFailed { message: "Not logged in".into() }),
    };
    drop(session);

    let links = match category {
        Some(cat) => sqlx::query_as!(
            Link,
            "SELECT * FROM links WHERE user_id = ? AND category = ? ORDER BY created_at DESC",
            user_id,
            cat,
        ).fetch_all(&state.db).await?,
        None => sqlx::query_as!(
            Link,
            "SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC",
            user_id,
        ).fetch_all(&state.db).await?,
    };

    // For each link, fetch its tags
    let mut result = Vec::with_capacity(links.len());
    for link in links {
        let tags = sqlx::query_as!(
            Tag,
            r#"
            SELECT t.id, t.user_id, t.name, t.color
            FROM tags t
            JOIN link_tags lt ON lt.tag_id = t.id
            WHERE lt.link_id = ?
            "#,
            link.id,
        )
        .fetch_all(&state.db)
        .await?;
        result.push(LinkWithTags { link, tags });
    }
    Ok(result)
}

/// Delete a link by ID — enforces user ownership
#[command]
pub async fn delete_link(link_id: String, state: State<'_, AppState>) -> VaultResult<()> {
    let session = state.session.read().await;
    let user_id = match &*session {
        Some(s) => s.user.id.clone(),
        None => return Err(VaultError::AuthFailed { message: "Not logged in".into() }),
    };
    drop(session);

    // SECURITY: Always scope deletes to the current user's ID
    // Without this, any authenticated user could delete any link by guessing its UUID
    let result = sqlx::query!(
        "DELETE FROM links WHERE id = ? AND user_id = ?",
        link_id,
        user_id,
    )
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(VaultError::NotFound { resource: format!("Link {}", link_id) });
    }
    Ok(())
}
```

### 4.7 — Main Entry Point (`src-tauri/src/main.rs` and `lib.rs`)

```rust
// lib.rs — This is where Tauri is assembled
pub mod commands;
pub mod db;
pub mod errors;
pub mod services;
pub mod state;

use tauri::Manager;
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Register all Tauri plugins
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        // Setup runs once at startup — initializes the DB and app state
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let app_state = AppState::new(&app_handle)
                    .await
                    .expect("FATAL: Failed to initialize application state. Check DB permissions.");
                app.manage(app_state);
            });
            Ok(())
        })
        // Register ALL Tauri command handlers
        .invoke_handler(tauri::generate_handler![
            // Auth
            commands::auth::get_auth_status,
            commands::auth::login_with_google,
            commands::auth::logout,
            // Links
            commands::links::save_link,
            commands::links::get_links,
            commands::links::delete_link,
            // Media
            commands::media::upload_media,
            commands::media::get_media,
            commands::media::delete_media,
            // Notes
            commands::notes::create_note,
            commands::notes::get_notes,
            commands::notes::update_note,
            commands::notes::delete_note,
            // Mindmaps
            commands::mindmap::save_mindmap,
            commands::mindmap::get_mindmaps,
            commands::mindmap::delete_mindmap,
        ])
        .run(tauri::generate_context!())
        .expect("FATAL: Tauri application failed to start");
}
```

---

## SECTION 5 — FRONTEND IMPLEMENTATION (REACT + TYPESCRIPT + VITE)

### 5.1 — TypeScript Types (`src/types/index.ts`)

These MUST mirror the Rust model structs exactly. Any mismatch is a runtime bug.

```typescript
// types/index.ts

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

export interface Link {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  category: LinkCategory;
  favicon_url: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkWithTags extends Link {
  tags: Tag[];
}

export type LinkCategory =
  | "youtube"
  | "instagram"
  | "pinterest"
  | "reddit"
  | "medium"
  | "twitter"
  | "linkedin"
  | "github"
  | "stackoverflow"
  | "tiktok"
  | "facebook"
  | "twitch"
  | "spotify"
  | "soundcloud"
  | "news"
  | "documentation"
  | "shopping"
  | "other";

export interface Media {
  id: string;
  user_id: string;
  link_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  media_type: "image" | "video";
  note: string | null;
  thumbnail_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  link_id: string | null;
  media_id: string | null;
  title: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mindmap {
  id: string;
  user_id: string;
  title: string;
  graph_data: string; // JSON string of { nodes, edges }
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

// Reactflow Mindmap types
export interface MindmapNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { label: string; note?: string };
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface MindmapGraphData {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}
```

### 5.2 — Typed Tauri Command Wrappers (`src/lib/tauri.ts`)

**WHY wrap invoke? Because `invoke<T>` from `@tauri-apps/api` is untyped by default.
We create typed wrappers once, and every hook uses them. No raw invoke() calls in components.**

```typescript
// lib/tauri.ts
import { invoke } from "@tauri-apps/api/core";
import type {
  User,
  LinkWithTags,
  Media,
  Note,
  Mindmap,
  SaveMindmapPayload,
} from "../types";

// -------- Auth --------
export const getAuthStatus = () =>
  invoke<{ is_authenticated: boolean; user: User | null }>("get_auth_status");

export const loginWithGoogle = () => invoke<User>("login_with_google");
export const logout = () => invoke<void>("logout");

// -------- Links --------
export const saveLink = (payload: {
  url: string;
  title?: string;
  description?: string;
}) => invoke<LinkWithTags>("save_link", { payload });

export const getLinks = (category?: string) =>
  invoke<LinkWithTags[]>("get_links", { category });

export const deleteLink = (linkId: string) =>
  invoke<void>("delete_link", { linkId });

// -------- Media --------
export const uploadMedia = (payload: {
  file_path: string;
  link_id?: string;
  note?: string;
}) => invoke<Media>("upload_media", { payload });

export const getMedia = () => invoke<Media[]>("get_media");
export const deleteMedia = (mediaId: string) =>
  invoke<void>("delete_media", { mediaId });

// -------- Notes --------
export const createNote = (payload: {
  title?: string;
  content: string;
  link_id?: string;
  media_id?: string;
}) => invoke<Note>("create_note", { payload });

export const getNotes = () => invoke<Note[]>("get_notes");

export const updateNote = (payload: {
  id: string;
  title?: string;
  content: string;
  is_pinned?: boolean;
}) => invoke<Note>("update_note", { payload });

export const deleteNote = (noteId: string) =>
  invoke<void>("delete_note", { noteId });

// -------- Mindmaps --------
export const saveMindmap = (payload: {
  id?: string;
  title: string;
  graph_data: string;
  thumbnail?: string;
}) => invoke<Mindmap>("save_mindmap", { payload });

export const getMindmaps = () => invoke<Mindmap[]>("get_mindmaps");
export const deleteMindmap = (mindmapId: string) =>
  invoke<void>("delete_mindmap", { mindmapId });
```

---

## SECTION 6 — SECURITY REQUIREMENTS (NON-NEGOTIABLE)

Every item in this section is mandatory. Missing even one is a security vulnerability.

### 6.1 — OAuth2 Token Storage

- **NEVER store tokens in SQLite plain text** unless the database file itself is encrypted.
- Use the `keyring` crate (v3.x) to store the `access_token` and `refresh_token` in the OS-native secure storage:
  - **macOS**: Keychain
  - **Windows**: Windows Credential Manager
  - **Linux**: libsecret (GNOME Keyring) or KWallet
- The `oauth_tokens` table in SQLite should store ONLY metadata (expiry time, user_id). The actual token strings go in the keyring.

### 6.2 — User Data Isolation

- **Every single database query that reads or modifies user data MUST include `WHERE user_id = ?`** with the currently authenticated user's ID.
- This is enforced at the Rust command level, not the frontend level.
- The frontend NEVER sends a `user_id` in payloads — the backend reads it from the session state.

### 6.3 — File Upload Security

- **Maximum file size**: 100MB for videos, 20MB for images. Enforce this in Rust before writing to disk.
- **MIME type validation**: Check the file's magic bytes (first N bytes), NOT just the file extension. A `.jpg` file can contain arbitrary data.
- **Supported types ONLY**:
  - Images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Videos: `video/mp4`, `video/webm`, `video/mov`
- **File storage**: Store media in `{data_dir}/media/{user_id}/{uuid}.{ext}` — never in a predictable path that could be guessed.
- **No executable files**: Reject anything with MIME types outside the whitelist above.

### 6.4 — SQL Injection Prevention

- Use SQLx's parameterized queries (`?` placeholders) EXCLUSIVELY.
- **NEVER use string formatting or concatenation to build SQL queries.**
- SQLx's `query!` and `query_as!` macros enforce parameterization at compile time.

### 6.5 — Tauri Capability System (v2)

In `src-tauri/capabilities/default.json`, grant ONLY the permissions the app actually needs:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for Vault desktop app",
  "windows": ["main"],
  "permissions": [
    "core:path:default",
    "core:event:default",
    "core:window:default",
    "core:app:default",
    "core:resources:default",
    "core:menu:default",
    "core:tray:default",
    "shell:allow-open",
    "dialog:allow-open",
    "fs:allow-app-read-write",
    "http:default"
  ]
}
```

Do NOT grant `fs:allow-read-recursive` at the root level. Scope it to the app data directory.

---

## SECTION 7 — TEST CASES (MANDATORY AT EVERY PHASE)

The AI must write and run tests at EACH phase before moving to the next.
Tests are not optional. Tests are not "later". Tests are NOW.

### 7.1 — Phase 1 Tests: Environment & Scaffolding

```bash
# Test 1: Can the project build?
cargo build
# EXPECTED: Exits with code 0. Zero errors. Warnings are acceptable but must be documented.

# Test 2: Can the dev server start?
npm run tauri dev
# EXPECTED: App window opens. No console errors in the Tauri webview.

# Test 3: Do Rust unit tests pass?
cargo test
# EXPECTED: All tests pass. Note the categorizer tests defined in Section 4.4.
```

### 7.2 — Phase 2 Tests: Database

```bash
# Test 4: Run migrations cleanly
cargo test db::migrations
# EXPECTED: No errors. All tables created as specified.

# Test 5: SQLite WAL mode is active
sqlite3 ~/.local/share/vault-app/vault.db "PRAGMA journal_mode;"
# EXPECTED OUTPUT: wal

# Test 6: Foreign key enforcement is ON
sqlite3 ~/.local/share/vault-app/vault.db "PRAGMA foreign_keys;"
# EXPECTED OUTPUT: 1
```

### 7.3 — Phase 3 Tests: Rust Commands

Write these as Rust integration tests in `src-tauri/tests/`:

```rust
// Tests to write (skeleton — AI fills in the implementation):

// test_save_link_categorizes_youtube_correctly()
// test_save_link_categorizes_instagram_correctly()
// test_save_link_with_invalid_url_returns_error()
// test_delete_link_enforces_user_ownership()  ← SECURITY CRITICAL
// test_unauthenticated_command_returns_auth_error()
// test_create_note_without_link()
// test_create_note_with_link()
// test_upload_media_rejects_oversized_files()
// test_upload_media_rejects_non_image_mime_types()
// test_save_and_retrieve_mindmap()
// test_delete_mindmap_enforces_ownership()
```

### 7.4 — Phase 4 Tests: Frontend Integration

Using Vitest + @testing-library/react:

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

Test cases to write:
- `LoginScreen renders correctly when unauthenticated`
- `LinkCard displays category badge with correct label`
- `SaveLinkModal validates URL format before submission`
- `NoteEditor allows saving a note without a link`
- `MindmapCanvas renders nodes and edges from graph_data`
- `All Tauri invoke calls are mocked correctly in tests`

### 7.5 — Phase 5 Tests: Security Audit Checklist

Before any release build, manually verify:

```
[ ] User A cannot access User B's links (test with two accounts)
[ ] Uploading a .exe file renamed to .jpg is rejected
[ ] Uploading a 200MB file is rejected with an appropriate error
[ ] SQL injection attempt in URL field is handled safely
[ ] Logging out clears the session state fully (no stale data in memory)
[ ] OAuth tokens are NOT stored in the SQLite database as plain text
[ ] The app does not request filesystem permissions outside its data directory
[ ] All network requests use HTTPS (no HTTP allowed)
[ ] The Tauri CSP header is set correctly in tauri.conf.json
```

---

## SECTION 8 — TAURI CONFIGURATION (`tauri.conf.json`)

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Vault",
  "version": "0.1.0",
  "identifier": "com.vault.app",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Vault",
        "width": 1200,
        "height": 800,
        "minWidth": 900,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' asset: https: data:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

---

## SECTION 9 — GOOGLE OAUTH2 SETUP INSTRUCTIONS (FOR DEVELOPER)

The AI cannot create a Google Cloud project for you. The developer must do this manually.

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project named "Vault App"
3. Navigate to **APIs & Services → OAuth consent screen**
   - User Type: External
   - App name: Vault
   - Scopes: `openid`, `email`, `profile`
4. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Desktop app**
   - Name: "Vault Desktop"
   - This gives you a `client_id` and `client_secret`
5. Create a `.env` file (copy from `.env.example`):
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   OAUTH_REDIRECT_PORT=8765
   ```
6. The redirect URI in Google Console must be: `http://127.0.0.1:8765`
   (Tauri spawns a temporary local server to receive the OAuth callback)

---

## SECTION 10 — BUILD AND RELEASE

### Development Mode

```bash
# Start the full dev environment (Rust + Vite hot-reload)
npm run tauri dev
```

### Production Build

```bash
# Build release binaries for the current platform
npm run tauri build

# Output locations:
# Windows: src-tauri/target/release/bundle/msi/
# macOS:   src-tauri/target/release/bundle/dmg/
# Linux:   src-tauri/target/release/bundle/deb/ or appimage/
```

### Cross-Compilation

Do NOT attempt cross-compilation from scratch. Use GitHub Actions with:
- `ubuntu-latest` for Linux
- `windows-latest` for Windows
- `macos-latest` for macOS

---

## SECTION 11 — PHASED IMPLEMENTATION SEQUENCE

**The AI MUST follow this sequence. No phase can be skipped.**

```
PHASE 1: Environment Verification
  → Run all version checks from Section 1
  → Report PASS/FAIL table
  → STOP if any FAIL

PHASE 2: Project Scaffolding
  → npm create tauri-app
  → Install dependencies (exact versions from Section 1.2)
  → Verify directory structure

PHASE 3: Database Foundation
  → Write migration SQL files
  → Write Rust models (models.rs)
  → Write AppState initialization (state.rs)
  → Run: cargo test (verify migrations apply cleanly)

PHASE 4: Error Layer
  → Write errors.rs
  → cargo build (verify it compiles)

PHASE 5: URL Categorizer Service
  → Write categorizer.rs in full
  → cargo test categorizer (ALL 10 tests must pass)

PHASE 6: Rust Command Handlers
  → Write auth.rs commands
  → Write links.rs commands (save, get, delete)
  → Write notes.rs commands
  → Write media.rs commands (with file validation)
  → Write mindmap.rs commands
  → Register all commands in lib.rs
  → cargo build (zero errors)

PHASE 7: Frontend Types and API Layer
  → Write types/index.ts
  → Write lib/tauri.ts
  → npm run build (zero TypeScript errors)

PHASE 8: Frontend Components
  → LoginScreen
  → Layout (Sidebar, TopBar)
  → Link components (grid, card, modal)
  → Note editor
  → Media uploader
  → Mindmap canvas (Reactflow)

PHASE 9: State Management
  → Zustand stores (authStore, uiStore)
  → TanStack Query hooks for all data fetching

PHASE 10: Security Audit
  → Run all items from Section 7.5 checklist
  → Fix ALL findings before proceeding

PHASE 11: Integration Testing
  → Run full test suite: cargo test + npm run test
  → Fix ALL failures

PHASE 12: Release Build
  → npm run tauri build
  → Verify installer works on a clean machine
```

---

## SECTION 12 — CONSTRAINTS AND RULES FOR THE AI

These are hard rules. Not suggestions.

1. **LTS versions only.** Never use alpha, beta, rc, or nightly crates/packages. Check crates.io for the latest STABLE version before adding any dependency.

2. **Compile-time verification.** Use SQLx's `query!` macro (not `query`) wherever possible for compile-time SQL checking. This requires `DATABASE_URL` to be set in `.env`.

3. **No unwrap() in production paths.** Every `unwrap()` or `expect()` in command handlers will be flagged. Use `?` operator with `VaultError`. `expect()` is only acceptable in `main.rs` for truly fatal initialization failures.

4. **No clippy warnings in release.** Run `cargo clippy -- -D warnings` before declaring any phase complete.

5. **No `todo!()` in shipping code.** Every `todo!()` must be tracked and resolved before Phase 12.

6. **Test first for security paths.** Write the test for `delete_link_enforces_user_ownership` BEFORE writing the implementation. This is the most critical security property.

7. **Never trust the frontend.** Every payload from the frontend is validated in Rust. The frontend cannot be trusted — it runs in a WebView that can be manipulated.

8. **Document every Tauri command.** Each `#[command]` function must have a doc comment explaining what it does, what it requires from the session, and what errors it can return.

9. **Consistent error messages.** Errors returned to the frontend must NEVER expose internal system paths, SQL details, or stack traces. Log those server-side; send generic messages to the client.

10. **Git commits at every phase boundary.** `git commit -m "Phase N complete: [description]"` after each phase passes all tests.

---

## FINAL CHECKLIST BEFORE SUBMITTING ANY CODE

```
[ ] All version checks pass (Section 1)
[ ] cargo build passes with zero errors
[ ] cargo clippy -- -D warnings passes
[ ] cargo test passes (all tests green)
[ ] npm run build passes with zero TypeScript errors
[ ] npm run test passes
[ ] No plain-text token storage
[ ] User data isolation enforced on every query
[ ] File upload MIME validation implemented
[ ] All Tauri commands registered in lib.rs
[ ] tauri.conf.json CSP is set
[ ] .env.example is committed (not .env)
[ ] .env is in .gitignore
[ ] Cargo.lock is committed to git
[ ] Phase sequence followed in order
```

---

*End of Prompt Document — Version 1.0.0*
*This document is the single source of truth for the Vault desktop application.*
*Any deviation from this spec must be explicitly documented and justified.*
