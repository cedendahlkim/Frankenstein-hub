use std::sync::Arc;

use axum::{extract::Request, http::StatusCode, middleware::Next, response::IntoResponse};
use jsonwebtoken::{decode, decode_header, jwk::JwkSet, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

use crate::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub aud: serde_json::Value,
    pub iss: String,
    pub exp: usize,
    #[serde(default)]
    pub scope: String,
    pub amr: Option<Vec<String>>,
}

pub async fn require_scope(
    required_scope: String,
    mut req: Request,
    next: Next,
) -> Result<impl IntoResponse, StatusCode> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(h) if h.starts_with("Bearer ") => h.trim_start_matches("Bearer "),
        _ => return Err(StatusCode::UNAUTHORIZED),
    };

    let state = req
        .extensions()
        .get::<Arc<AppState>>()
        .cloned()
        .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

    let jwks_url = format!(
        "https://{}/.well-known/jwks.json",
        state.config.auth0_domain
    );

    let jwks: JwkSet = state
        .http_client
        .get(&jwks_url)
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .json()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let header = decode_header(token).map_err(|_| StatusCode::UNAUTHORIZED)?;
    let kid = header.kid.ok_or(StatusCode::UNAUTHORIZED)?;
    let jwk = jwks.find(&kid).ok_or(StatusCode::UNAUTHORIZED)?;

    let decoding_key =
        DecodingKey::from_jwk(jwk).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[&state.config.auth0_audience]);
    validation.set_issuer(&[format!("https://{}/", state.config.auth0_domain)]);

    let token_data =
        decode::<Claims>(token, &decoding_key, &validation).map_err(|e| {
            tracing::warn!("JWT validation failed: {}", e);
            StatusCode::UNAUTHORIZED
        })?;

    let scopes: Vec<&str> = token_data.claims.scope.split_whitespace().collect();
    if !scopes.contains(&required_scope.as_str()) {
        return Err(StatusCode::FORBIDDEN);
    }

    req.extensions_mut().insert(token_data.claims);
    req.extensions_mut().insert(token.to_string());
    Ok(next.run(req).await)
}
