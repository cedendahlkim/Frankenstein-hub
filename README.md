# 🧟 Frankenstein AI — Multi-Agent Authorization Hub

> **Zero Trust authorization layer for autonomous AI sub-agents**, powered by Auth0 Token Vault (RFC 8693), Step-Up MFA, and CIBA.

Built for the **"Authorized to Act: Auth0 for AI Agents"** hackathon.

**🎯 Demo mode available** — visit `/dashboard` without signing in to explore the full UI with simulated auth flows.

---

## The Problem

AI agents increasingly need to act on behalf of users across multiple services — but traditional OAuth patterns treat agents as monolithic applications with broad, persistent access. This creates a **massive security surface**: one compromised agent can access everything.

## Our Solution

Frankenstein AI treats each sub-agent as an **independently authorized entity** with:

- **No persistent credentials** — tokens are exchanged at runtime via Token Vault and immediately discarded
- **Graduated authorization** — routine tasks need standard auth, high-value actions require Step-Up MFA
- **Human-in-the-loop for destructive ops** — CIBA ensures background agents wait for explicit user approval via push notification

---

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
│                   Rust / Axum Backend                        │
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
              │  · Token Vault     │
              │  · CIBA / Guardian │
              │  · Step-Up MFA     │
              │  · My Account API  │
              └────────────────────┘
```

## Sub-Agents

| Agent | Provider | Auth Mechanism | Scope |
| --- | --- | --- | --- |
| 🔬 **Analyst** | Google Workspace | Token Vault Exchange (RFC 8693) | `invoke:analyst` |
| 🎨 **Creativist** | GitHub | Token Vault + Step-Up MFA | `invoke:creativist`, `publish:article` |
| 🔍 **Critic** | System | CIBA Background Consent (Guardian push) | `invoke:critic` |

### Security Model

1. **Analyst** — exchanges the user's Auth0 session for an ephemeral Google access token at runtime. The token is used once and discarded. Zero credentials stored.

2. **Creativist** — same Token Vault exchange for GitHub, but the `publish:article` scope triggers a Post-Login Action enforcing MFA. The backend verifies `amr: ["mfa"]` before allowing the publish.

3. **Critic** — initiates a CIBA backchannel request. Auth0 sends a Guardian push notification to the user's phone. The backend polls `/oauth/token` until consent is granted or denied. No action executes without explicit approval.

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 14, React 18, Tailwind CSS, @auth0/nextjs-auth0 |
| **Backend** | Rust 1.94, Axum 0.7, SQLx 0.7, jsonwebtoken 9.3 |
| **Auth** | Auth0 (Token Vault, CIBA, Step-Up MFA, My Account API) |
| **Database** | PostgreSQL 16 |
| **Deployment** | VPS, Nginx, systemd, Certbot SSL |

## Quick Start

### Prerequisites

- Node.js 18+
- Rust 1.75+ (`rustup install stable`)
- Docker (for PostgreSQL) or PostgreSQL 15+
- Auth0 tenant (see [`docs/AUTH0_SETUP.md`](docs/AUTH0_SETUP.md))

### 1. Database

```bash
docker run -d --name frankenstein-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=frankenstein \
  -p 5432:5432 postgres:16-alpine
```

### 2. Backend

```bash
cd backend
# Edit .env with your Auth0 credentials (see docs/AUTH0_SETUP.md)
cargo run
# → Listening on 0.0.0.0:8080
```

### 3. Frontend

```bash
cd frontend
npm install
# Edit .env.local with your Auth0 credentials
npm run dev
# → http://localhost:3000
```

### 4. Demo Mode

Visit `http://localhost:3000/dashboard` — no Auth0 configuration needed. Click agent buttons to see simulated authorization flows with real-time audit logging.

## Auth0 Features Used

| Feature | How We Use It |
| --- | --- |
| **Token Vault** (RFC 8693) | Federated token exchange for Google & GitHub — no credentials stored |
| **Step-Up MFA** | Post-Login Action enforces MFA for `publish:article` scope |
| **CIBA** | Background consent via Guardian push for destructive operations |
| **My Account API** | Display connected accounts + manage consent in dashboard |
| **Auth0 Guardian** | Push notifications for both MFA challenges and CIBA approvals |

## Documentation

- [`docs/AUTH0_SETUP.md`](docs/AUTH0_SETUP.md) — Step-by-step tenant configuration (12 steps)
- [`docs/PLANNING.md`](docs/PLANNING.md) — Architecture decisions and design rationale
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — VPS deployment guide
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — Development log and status tracking
- [`docs/TASK.md`](docs/TASK.md) — Original hackathon spec analysis

## License

MIT
