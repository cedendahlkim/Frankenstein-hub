use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AgentMetadata {
    pub id: Uuid,
    pub auth0_user_id: String,
    pub agent_identifier: String,
    pub required_scopes: String,
    pub allowed_connections: String,
    pub requires_step_up: bool,
    pub requires_ciba: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentStatusResponse {
    pub agent: String,
    pub status: String,
    pub scopes: Vec<String>,
    pub connections: Vec<String>,
    pub requires_step_up: bool,
    pub requires_ciba: bool,
}
