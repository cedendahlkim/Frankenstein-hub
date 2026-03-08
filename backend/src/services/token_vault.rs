use std::sync::Arc;

use crate::error::AppError;
use crate::models::auth::{TokenExchangeRequest, TokenExchangeResponse};
use crate::AppState;

pub async fn exchange_subject_token(
    state: &Arc<AppState>,
    subject_token: &str,
    connection_name: &str,
) -> Result<String, AppError> {
    let url = format!("https://{}/oauth/token", state.config.auth0_domain);

    let payload = TokenExchangeRequest {
        grant_type: "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
        client_id: &state.config.auth0_m2m_client_id,
        client_secret: &state.config.auth0_m2m_client_secret,
        subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
        subject_token,
        requested_token_type: "http://auth0.com/oauth/token-type/federated-connection-access-token",
        connection: connection_name,
    };

    let response = state
        .http_client
        .post(&url)
        .form(&payload)
        .send()
        .await
        .map_err(|_| AppError::InternalServerError)?;

    if !response.status().is_success() {
        tracing::error!(
            "Token exchange failed with status: {}",
            response.status()
        );
        return Err(AppError::TokenExchangeFailed);
    }

    let token_resp: TokenExchangeResponse = response
        .json()
        .await
        .map_err(|_| AppError::InternalServerError)?;

    Ok(token_resp.access_token)
}
