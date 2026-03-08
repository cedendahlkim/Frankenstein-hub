CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE agent_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_user_id VARCHAR(255) NOT NULL,
    agent_identifier VARCHAR(50) NOT NULL CHECK (agent_identifier IN ('analyst', 'creativist', 'critic')),
    required_scopes VARCHAR(255) NOT NULL,
    allowed_connections VARCHAR(255) NOT NULL,
    requires_step_up BOOLEAN DEFAULT FALSE,
    requires_ciba BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(auth0_user_id, agent_identifier)
);

CREATE INDEX idx_agent_metadata_user ON agent_metadata(auth0_user_id);
