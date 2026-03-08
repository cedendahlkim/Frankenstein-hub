use std::sync::Arc;

use crate::error::AppError;
use crate::models::auth::{CibaInitiationRequest, CibaInitiationResponse};
use crate::AppState;

pub async fn trigger_and_poll_ciba(
    state: &Arc<AppState>,
    user_id: &str,
    action_message: &str,
) -> Result<String, AppError> {
    // 1. Initiate CIBA Request
    let auth_url = format!("https://{}/bc-authorize", state.config.auth0_domain);
    let init_payload = CibaInitiationRequest {
        client_id: &state.config.auth0_m2m_client_id,
        client_secret: &state.config.auth0_m2m_client_secret,
        login_hint: user_id,
        binding_message: action_message,
        scope: "openid offline_access invoke:critic",
    };

    let init_resp: CibaInitiationResponse = state
        .http_client
        .post(&auth_url)
        .form(&init_payload)
        .send()
        .await
        .map_err(|_| AppError::InternalServerError)?
        .json()
        .await
        .map_err(|_| AppError::InternalServerError)?;

    tracing::info!(
        "CIBA request initiated, auth_req_id: {}",
        init_resp.auth_req_id
    );

    // 2. Asynchronous Polling Loop
    let token_url = format!("https://{}/oauth/token", state.config.auth0_domain);
    let mut interval =
        tokio::time::interval(std::time::Duration::from_secs(init_resp.interval));

    loop {
        interval.tick().await;

        let poll_payload = [
            ("grant_type", "urn:openid:params:grant-type:ciba"),
            ("client_id", &state.config.auth0_m2m_client_id),
            ("client_secret", &state.config.auth0_m2m_client_secret),
            ("auth_req_id", &init_resp.auth_req_id),
        ];

        let poll_resp = state
            .http_client
            .post(&token_url)
            .form(&poll_payload)
            .send()
            .await
            .map_err(|_| AppError::InternalServerError)?;

        if poll_resp.status().is_success() {
            let token_data: serde_json::Value = poll_resp
                .json()
                .await
                .map_err(|_| AppError::InternalServerError)?;

            let access_token = token_data["access_token"]
                .as_str()
                .ok_or(AppError::InternalServerError)?
                .to_string();

            tracing::info!("CIBA authorization granted");
            return Ok(access_token);
        } else {
            let err_data: serde_json::Value = poll_resp
                .json()
                .await
                .map_err(|_| AppError::InternalServerError)?;

            if err_data["error"] == "authorization_pending" {
                tracing::debug!("CIBA: waiting for user approval...");
                continue;
            } else {
                tracing::warn!("CIBA authorization denied: {:?}", err_data);
                return Err(AppError::CibaAuthorizationDenied);
            }
        }
    }
}
