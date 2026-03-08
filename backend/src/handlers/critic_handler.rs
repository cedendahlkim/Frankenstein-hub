use std::sync::Arc;

use axum::{Extension, Json};
use serde_json::{json, Value};

use crate::middleware::jwt_validator::Claims;
use crate::AppState;

pub async fn review_and_execute(
    Extension(claims): Extension<Claims>,
    Extension(state): Extension<Arc<AppState>>,
) -> Result<Json<Value>, crate::error::AppError> {
    tracing::info!("Critic agent invoked by user: {}", claims.sub);

    // Initiate CIBA flow for background consent
    let action_message = "Critic Agent requests permission to execute destructive review action";

    let ciba_token = crate::services::ciba_orchestrator::trigger_and_poll_ciba(
        &state,
        &claims.sub,
        action_message,
    )
    .await?;

    tracing::info!(
        "CIBA consent received for critic agent, user: {}",
        claims.sub
    );

    // Execute the destructive action with the CIBA-authorized token
    // In production, this would perform the actual review/deletion operation
    let result = json!({
        "agent": "critic",
        "status": "success",
        "action": "destructive_review",
        "ciba_authorized": true,
        "message": "Background task executed after user consent via push notification"
    });

    Ok(Json(result))
}
