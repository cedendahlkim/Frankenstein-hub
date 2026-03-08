# Frankenstein AI - Multi-Agent Authorization Hub

> Zero Trust authorization layer for autonomous AI sub-agents, powered by Auth0 Token Vault, Step-Up MFA, and CIBA.

Built for the **"Authorized to Act: Auth0 for AI Agents"** hackathon.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                         │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Auth0    │  │  Dashboard   │  │  Consent Manager   │    │
│  │  Login    │  │  Agent Cards │  │  (My Account API)  │    │
│  └──────────┘  └──────────────┘  └────────────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS (Nginx Reverse Proxy)
┌───────────────────────┴─────────────────────────────────────┐
│                   Rust Axum Backend                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ JWT Validate │  │ Token Vault  │  │ CIBA Orchestrator│   │
│  │ + Scope      │  │ RFC 8693     │  │ Background Auth  │   │
│  │ Enforcement  │  │ Exchange     │  │ Polling          │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Agent Handlers: Analyst │ Creativist │ Critic      │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                        │
              ┌─────────┴──────────┐
              │   Auth0 Tenant     │
              │  - Token Vault     │
              │  - CIBA / Guardian │
              │  - Step-Up MFA     │
              │  - My Account API  │
              └────────────────────┘
```

## Sub-Agents

| Agent       | Provider         | Auth Mechanism         |
|-------------|------------------|------------------------|
| **Analyst**    | Google Workspace | Token Vault Exchange   |
| **Creativist** | GitHub           | Step-Up MFA + Token Vault |
| **Critic**     | System           | CIBA Background Consent |

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, @auth0/nextjs-auth0
- **Backend**: Rust, Axum, SQLx, jsonwebtoken
- **Auth**: Auth0 (Token Vault, CIBA, Step-Up MFA, My Account API)
- **Database**: PostgreSQL
- **Deployment**: VPS (95.217.7.221), Nginx, Certbot SSL

## Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.75+
- PostgreSQL 15+
- Auth0 tenant configured (see Phase 1 in spec)

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local  # Configure Auth0 credentials
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env  # Configure Auth0 + DB credentials
cargo run
```

### Production Deployment
```bash
# On VPS (95.217.7.221)
sudo systemctl start frankenstein-api
sudo systemctl start frankenstein-web
sudo certbot --nginx -d app.gracestack.se
```

## Auth0 Configuration Checklist

- [ ] Frontend App: "Frankenstein AI Frontend" (Regular Web App)
- [ ] Backend API: "Frankenstein Backend API" (audience: `https://api.gracestack.se`)
- [ ] M2M App: "Frankenstein API Client" with Token Vault grant type
- [ ] My Account API enabled with connected_accounts scopes
- [ ] Social connections (google-oauth2, github) with `offline_access`
- [ ] MFA: Auth0 Guardian enabled
- [ ] Post-Login Action: "Enforce Step-Up for High Value Scopes"
- [ ] CIBA grant enabled on Frontend App

## License

MIT
