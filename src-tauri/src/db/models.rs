// models.rs
// WHY explicit structs and not a generic HashMap?
// Because sqlx's compile-time checking (`query_as!`) requires concrete types.
// These structs are the single source of truth between the DB schema and Rust code.

use serde::{Deserialize, Serialize};

// -------- User --------
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String, // UUID as TEXT
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
