use std::sync::Arc;

use axum::{Extension, Json};
use serde_json::{json, Value};

use crate::middleware::jwt_validator::Claims;
use crate::AppState;

pub async fn execute_analyst_task(
    Extension(claims): Extension<Claims>,
    Extension(raw_token): Extension<String>,
    Extension(state): Extension<Arc<AppState>>,
) -> Result<Json<Value>, crate::error::AppError> {
    tracing::info!("Analyst agent invoked by user: {}", claims.sub);

    // Exchange the Auth0 token for a Google access token via Token Vault
    let google_token = crate::services::token_vault::exchange_subject_token(
        &state,
        &raw_token,
        "google-oauth2",
    )
    .await?;

    // The Analyst agent uses the ephemeral google_token to call Google APIs
    let response = state
        .http_client
        .get("https://www.googleapis.com/drive/v3/files")
        .header("Authorization", format!("Bearer {}", google_token))
        .send()
        .await
        .map_err(|_| crate::error::AppError::InternalServerError)?
        .json::<Value>()
        .await
        .map_err(|_| crate::error::AppError::InternalServerError)?;

    tracing::info!("Analyst task executed successfully");

    Ok(Json(json!({
        "agent": "analyst",
        "status": "success",
        "data": response
    })))
}
