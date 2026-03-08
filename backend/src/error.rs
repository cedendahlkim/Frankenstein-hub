use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Internal server error")]
    InternalServerError,

    #[error("Token exchange failed")]
    TokenExchangeFailed,

    #[error("CIBA authorization denied")]
    CibaAuthorizationDenied,

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Forbidden: insufficient scope")]
    Forbidden,

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Request error: {0}")]
    Request(#[from] reqwest::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match &self {
            AppError::InternalServerError => {
                (StatusCode::INTERNAL_SERVER_ERROR, self.to_string())
            }
            AppError::TokenExchangeFailed => {
                (StatusCode::BAD_GATEWAY, self.to_string())
            }
            AppError::CibaAuthorizationDenied => {
                (StatusCode::FORBIDDEN, self.to_string())
            }
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, self.to_string()),
            AppError::Forbidden => (StatusCode::FORBIDDEN, self.to_string()),
            AppError::Database(e) => {
                tracing::error!("Database error: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Database error".to_string(),
                )
            }
            AppError::Request(e) => {
                tracing::error!("HTTP request error: {}", e);
                (
                    StatusCode::BAD_GATEWAY,
                    "External request failed".to_string(),
                )
            }
        };

        let body = Json(json!({ "error": message }));
        (status, body).into_response()
    }
}
