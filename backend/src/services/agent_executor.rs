use std::sync::Arc;

use crate::error::AppError;
use crate::models::agent::AgentMetadata;
use crate::AppState;

pub async fn get_agent_metadata(
    state: &Arc<AppState>,
    user_id: &str,
    agent_identifier: &str,
) -> Result<AgentMetadata, AppError> {
    let metadata = sqlx::query_as::<_, AgentMetadata>(
        "SELECT * FROM agent_metadata WHERE auth0_user_id = $1 AND agent_identifier = $2",
    )
    .bind(user_id)
    .bind(agent_identifier)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::Forbidden)?;

    Ok(metadata)
}

pub async fn ensure_agent_metadata(
    state: &Arc<AppState>,
    user_id: &str,
    agent_identifier: &str,
    required_scopes: &str,
    allowed_connections: &str,
    requires_step_up: bool,
    requires_ciba: bool,
) -> Result<AgentMetadata, AppError> {
    let metadata = sqlx::query_as::<_, AgentMetadata>(
        r#"
        INSERT INTO agent_metadata (auth0_user_id, agent_identifier, required_scopes, allowed_connections, requires_step_up, requires_ciba)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (auth0_user_id, agent_identifier)
        DO UPDATE SET required_scopes = $3, allowed_connections = $4, requires_step_up = $5, requires_ciba = $6, updated_at = CURRENT_TIMESTAMP
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(agent_identifier)
    .bind(required_scopes)
    .bind(allowed_connections)
    .bind(requires_step_up)
    .bind(requires_ciba)
    .fetch_one(&state.db)
    .await?;

    Ok(metadata)
}
