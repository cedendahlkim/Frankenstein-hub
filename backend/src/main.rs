use std::sync::Arc;

use axum::Router;
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

mod config;
mod error;
mod handlers;
mod middleware;
mod models;
mod routes;
mod services;

pub struct AppState {
    pub db: sqlx::PgPool,
    pub http_client: reqwest::Client,
    pub config: config::Config,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let config = config::Config::from_env();

    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .expect("Database connection failed");

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&db)
        .await
        .expect("Failed to run migrations");

    let http_client = reqwest::Client::new();
    let state = Arc::new(AppState {
        db,
        http_client,
        config: config.clone(),
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_headers(Any)
        .allow_methods(Any);

    let app = routes::create_router(state.clone())
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let listener = TcpListener::bind(format!("0.0.0.0:{}", config.port))
        .await
        .unwrap();
    tracing::info!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
