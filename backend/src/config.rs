use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub auth0_domain: String,
    pub auth0_audience: String,
    pub auth0_m2m_client_id: String,
    pub auth0_m2m_client_secret: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            auth0_domain: env::var("AUTH0_DOMAIN").expect("AUTH0_DOMAIN must be set"),
            auth0_audience: env::var("AUTH0_AUDIENCE").expect("AUTH0_AUDIENCE must be set"),
            auth0_m2m_client_id: env::var("AUTH0_M2M_CLIENT_ID")
                .expect("AUTH0_M2M_CLIENT_ID must be set"),
            auth0_m2m_client_secret: env::var("AUTH0_M2M_CLIENT_SECRET")
                .expect("AUTH0_M2M_CLIENT_SECRET must be set"),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("PORT must be a valid u16"),
        }
    }
}
