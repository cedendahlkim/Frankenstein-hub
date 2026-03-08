use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenExchangeRequest<'a> {
    pub grant_type: &'a str,
    pub client_id: &'a str,
    pub client_secret: &'a str,
    pub subject_token_type: &'a str,
    pub subject_token: &'a str,
    pub requested_token_type: &'a str,
    pub connection: &'a str,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenExchangeResponse {
    pub access_token: String,
    pub expires_in: u64,
    pub token_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CibaInitiationRequest<'a> {
    pub client_id: &'a str,
    pub client_secret: &'a str,
    pub login_hint: &'a str,
    pub binding_message: &'a str,
    pub scope: &'a str,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CibaInitiationResponse {
    pub auth_req_id: String,
    pub expires_in: u64,
    pub interval: u64,
}
