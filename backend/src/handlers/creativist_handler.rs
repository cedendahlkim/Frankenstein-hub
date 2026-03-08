use std::sync::Arc;

use axum::{Extension, Json};
use serde_json::{json, Value};

use crate::middleware::jwt_validator::Claims;
use crate::AppState;

pub async fn draft_content(
    Extension(claims): Extension<Claims>,
    Extension(raw_token): Extension<String>,
    Extension(state): Extension<Arc<AppState>>,
) -> Result<Json<Value>, crate::error::AppError> {
    tracing::info!("Creativist agent invoked by user: {}", claims.sub);

    // Exchange the Auth0 token for a GitHub access token via Token Vault
    let github_token = crate::services::token_vault::exchange_subject_token(
        &state,
        &raw_token,
        "github",
    )
    .await?;

    // The Creativist agent uses the ephemeral github_token to interact with GitHub
    let response = state
        .http_client
        .get("https://api.github.com/user/repos?sort=updated&per_page=5")
        .header("Authorization", format!("Bearer {}", github_token))
        .header("User-Agent", "FrankensteinAI-Creativist/1.0")
        .send()
        .await
        .map_err(|_| crate::error::AppError::InternalServerError)?
        .json::<Value>()
        .await
        .map_err(|_| crate::error::AppError::InternalServerError)?;

    tracing::info!("Creativist draft task executed successfully");

    Ok(Json(json!({
        "agent": "creativist",
        "status": "success",
        "data": response
    })))
}

pub async fn publish_article(
    Extension(claims): Extension<Claims>,
    Extension(raw_token): Extension<String>,
    Extension(state): Extension<Arc<AppState>>,
) -> Result<Json<Value>, crate::error::AppError> {
    tracing::info!(
        "Creativist agent publish invoked by user: {}",
        claims.sub
    );

    // Verify step-up authentication was performed (MFA)
    if let Some(ref amr) = claims.amr {
        if !amr.contains(&"mfa".to_string()) {
            tracing::warn!("Step-up MFA not detected for publish action");
            return Err(crate::error::AppError::Forbidden);
        }
    } else {
        return Err(crate::error::AppError::Forbidden);
    }

    let github_token = crate::services::token_vault::exchange_subject_token(
        &state,
        &raw_token,
        "github",
    )
    .await?;

    // Simulate article publication via GitHub API (e.g., create a gist)
    let gist_payload = json!({
        "description": "Published by Frankenstein AI Creativist Agent",
        "public": true,
        "files": {
            "article.md": {
                "content": "# AI-Generated Article\n\nThis article was published by the Creativist Agent with Step-Up MFA authorization."
            }
        }
    });

    let response = state
        .http_client
        .post("https://api.github.com/gists")
        .header("Authorization", format!("Bearer {}", github_token))
        .header("User-Agent", "FrankensteinAI-Creativist/1.0")
        .json(&gist_payload)
        .send()
        .await
        .map_err(|_| crate::error::AppError::InternalServerError)?
        .json::<Value>()
        .await
        .map_err(|_| crate::error::AppError::InternalServerError)?;

    tracing::info!("Creativist publish executed with step-up auth");

    Ok(Json(json!({
        "agent": "creativist",
        "action": "publish",
        "status": "success",
        "data": response
    })))
}
