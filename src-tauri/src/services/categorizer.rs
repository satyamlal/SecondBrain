// categorizer.rs
// WHY deterministic pattern matching and not an LLM?
// Speed: This runs on every link save. It must be instantaneous (<1ms).
// Correctness: "youtube.com" is always YouTube. You don't need a neural net for this.
// Privacy: No user data leaves the app for categorization.

use url::Url;

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

fn match_domain(domain: &str, _url: &Url) -> (LinkCategory, Vec<String>) {
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
