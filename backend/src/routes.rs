use std::sync::Arc;

use axum::{
    middleware,
    routing::{get, post},
    Extension, Router,
};

use crate::handlers::{analyst_handler, creativist_handler, critic_handler};
use crate::middleware::jwt_validator::require_scope;
use crate::AppState;

pub fn create_router(state: Arc<AppState>) -> Router {
    let analyst_routes = Router::new()
        .route(
            "/execute",
            post(analyst_handler::execute_analyst_task),
        )
        .layer(middleware::from_fn(move |req, next| {
            require_scope("invoke:analyst".to_string(), req, next)
        }));

    let creativist_routes = Router::new()
        .route(
            "/draft",
            post(creativist_handler::draft_content),
        )
        .layer(middleware::from_fn(move |req, next| {
            require_scope("invoke:creativist".to_string(), req, next)
        }))
        .route(
            "/publish",
            post(creativist_handler::publish_article),
        )
        .layer(middleware::from_fn(move |req, next| {
            require_scope("publish:article".to_string(), req, next)
        }));

    let critic_routes = Router::new()
        .route(
            "/review",
            post(critic_handler::review_and_execute),
        )
        .layer(middleware::from_fn(move |req, next| {
            require_scope("invoke:critic".to_string(), req, next)
        }));

    let health_route = Router::new().route("/health", get(health_check));

    Router::new()
        .nest("/agents/analyst", analyst_routes)
        .nest("/agents/creativist", creativist_routes)
        .nest("/agents/critic", critic_routes)
        .merge(health_route)
        .layer(Extension(state))
}

async fn health_check() -> &'static str {
    "OK"
}
