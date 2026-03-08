# PLANNING.md — Arkitekturplan & Utvecklingsfaser

## Monorepo-struktur

```
frankenstein-hub/
├── .gitignore
├── README.md
├── docs/
│   ├── TASK.md              # Uppgiftsbeskrivning + hackathon-krav
│   ├── PLANNING.md          # Denna fil
│   ├── PROGRESS.md          # Status & vad som återstår
│   ├── AUTH0_SETUP.md       # Steg-för-steg Auth0-konfiguration
│   └── DEPLOYMENT.md        # VPS/Nginx deploy-instruktioner
├── frontend/                # Next.js 14 + Tailwind
│   ├── .env.local           # Auth0 credentials (EJ committad)
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── app/
│   │   ├── layout.tsx       # Root layout, UserProvider, Navigation
│   │   ├── page.tsx         # Landing page (hero + feature cards)
│   │   ├── globals.css      # Tailwind + custom utility classes
│   │   ├── api/
│   │   │   ├── auth/[auth0]/route.ts   # Auth0 login/callback/logout
│   │   │   └── myaccount/route.ts      # Proxy till Auth0 My Account API
│   │   └── dashboard/
│   │       ├── page.tsx     # Huvud-dashboard med 3 agent-kort
│   │       ├── loading.tsx  # Suspense loading state
│   │       └── error.tsx    # Error boundary
│   ├── components/
│   │   ├── AgentCard.tsx    # Visuellt kort per agent
│   │   ├── ConsentManager.tsx  # Connected accounts sidebar
│   │   ├── StepUpModal.tsx  # MFA step-up dialog
│   │   └── Navigation.tsx   # Top navbar
│   ├── lib/
│   │   ├── auth0.ts         # Auth0 SDK-konfiguration
│   │   └── apiClient.ts     # API-anrop + step-up intercept
│   └── types/
│       └── agent.d.ts       # TypeScript interfaces
├── backend/                 # Rust / Axum
│   ├── .env                 # Auth0 + DB credentials (EJ committad)
│   ├── Cargo.toml
│   ├── build.rs
│   ├── migrations/
│   │   └── 20260401000000_initial_schema.sql
│   └── src/
│       ├── main.rs          # Entry point: DB pool, router, server
│       ├── config.rs        # Env-variabel-laddning
│       ├── error.rs         # AppError enum + IntoResponse
│       ├── routes.rs        # Router-definitioner + scope-middleware
│       ├── models/
│       │   ├── mod.rs
│       │   ├── agent.rs     # AgentMetadata struct (SQLx)
│       │   └── auth.rs      # TokenExchange + CIBA request/response structs
│       ├── middleware/
│       │   ├── mod.rs
│       │   └── jwt_validator.rs  # JWKS-fetch, JWT-decode, scope enforcement
│       ├── services/
│       │   ├── mod.rs
│       │   ├── token_vault.rs      # RFC 8693 token exchange
│       │   ├── ciba_orchestrator.rs # CIBA initiation + polling
│       │   └── agent_executor.rs   # Agent metadata CRUD
│       └── handlers/
│           ├── mod.rs
│           ├── analyst_handler.rs    # Google Drive API via token vault
│           ├── creativist_handler.rs # GitHub API + step-up verify
│           └── critic_handler.rs     # CIBA consent flow
└── infra/                   # Referens-configs (kopieras manuellt till VPS)
    ├── frankenstein-api.service
    ├── frankenstein-web.service
    └── nginx-app.gracestack.se.conf
```

## Fas-indelning

### Fas 1: Auth0 Tenant Configuration ⏳ (Manuell)
Se `AUTH0_SETUP.md` för fullständiga steg.
- [ ] Frontend App: "Frankenstein AI Frontend" (Regular Web App)
- [ ] Backend API: "Frankenstein Backend API" (audience: `https://api.gracestack.se`)
- [ ] M2M App: "Frankenstein API Client" med Token Vault grant
- [ ] My Account API aktiverad med connected_accounts scopes
- [ ] Social connections (google-oauth2, github) med offline_access
- [ ] MFA: Auth0 Guardian aktiverad
- [ ] Post-Login Action: "Enforce Step-Up for High Value Scopes"
- [ ] CIBA grant aktiverad på Frontend App

### Fas 2: Scaffolding ✅ (Klar)
- [x] Monorepo-struktur skapad
- [x] Backend: alla Rust-filer (main, config, error, routes, models, middleware, services, handlers)
- [x] Frontend: Next.js app med alla sidor, komponenter, lib, types
- [x] Infra: systemd + nginx configs
- [x] npm install (frontend)
- [x] Git init + initial commit

### Fas 3: Backend Compilation & Test 🔜
- [ ] Verifiera `cargo check` kompilerar utan fel
- [ ] Fixa eventuella Rust-kompileringsfel
- [ ] Skapa PostgreSQL-databas `frankenstein` lokalt
- [ ] Kör migrations
- [ ] Testa health endpoint: `GET /health`

### Fas 4: Frontend Dev Server 🔜
- [ ] Verifiera `npm run dev` startar utan fel
- [ ] Testa landing page renderar korrekt
- [ ] Testa Auth0 login redirect (kräver Auth0-config)
- [ ] Testa dashboard-sidan (kräver inloggning)

### Fas 5: Integration & Auth0 Flow 🔜
- [ ] Fyll i `.env.local` och `.env` med riktiga credentials
- [ ] End-to-end: Login → Dashboard → Connect Google → Execute Analyst
- [ ] Testa Step-Up MFA flow (Creativist publish)
- [ ] Testa CIBA flow (Critic review)

### Fas 6: Polish & Demo 🔜
- [ ] UI-polish: animationer, responsivitet
- [ ] Error handling: edge cases, timeout, nätverksfel
- [ ] Loggar: tydliga Rust-loggar för demo split-screen
- [ ] Spela in 3-min demo

### Fas 7: Deploy till VPS 🔜
- [ ] SSH till 95.217.7.221
- [ ] Installera Rust, PostgreSQL, Node.js
- [ ] Kopiera repo, bygg, konfigurera systemd + nginx
- [ ] Certbot SSL

### Fas 8: Devpost Submission 🔜
- [ ] Devpost-profil + projekt
- [ ] Ladda upp video
- [ ] Skriv blog-post (250+ ord)
- [ ] Publicera

## Arkitekturbeslut

### Varför Rust/Axum?
- Säkerhetsnarrativ: "Zero Trust kräver ett memory-safe backend"
- Imponerar på hackathon-domare
- Token aldrig i heap efter handler-scope exits

### Varför Next.js App Router?
- @auth0/nextjs-auth0 v3 stödjer App Router
- Server-side token management (getAccessToken)
- API routes som proxy till Auth0 My Account API

### Varför PostgreSQL?
- SQLx stödjer async Rust
- Enbart metadata-lagring (tokens hanteras av Auth0 Token Vault)
- Migrations via sqlx::migrate!

### Nginx-routing
- `/api/*` → Rust Axum (port 8080)
- `/*` → Next.js (port 3000)
- SSL via Certbot

## Dataflöden

### Token Vault Exchange (Analyst)
```
User → Frontend (click Execute) → POST /api/agents/analyst/execute
  → Nginx → Axum (port 8080)
    → JWT middleware: validate Bearer token, check scope "invoke:analyst"
    → Handler: extract raw_token from extensions
    → token_vault::exchange_subject_token(raw_token, "google-oauth2")
      → POST https://{auth0_domain}/oauth/token
        grant_type: urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token
        subject_token: <user's Auth0 access token>
        connection: "google-oauth2"
      ← ephemeral Google access_token (short-lived)
    → GET https://www.googleapis.com/drive/v3/files (Bearer ephemeral_token)
    ← JSON response
  ← { agent: "analyst", status: "success", data: ... }
```

### Step-Up MFA (Creativist publish)
```
User → Frontend (click Publish) → POST /api/agents/creativist/publish
  → Axum JWT middleware: check scope "publish:article"
  → MISSING → return 403 Forbidden
← Frontend catches 403, shows StepUpModal
  → User confirms → redirect to /api/auth/login?acr_values=...multi-factor
  → Auth0 Login → Post-Login Action detects "publish:article" scope
  → api.multifactor.enable('any') → MFA challenge
  → User completes MFA → callback with elevated token
  → Retry POST /api/agents/creativist/publish
  → JWT now includes "publish:article" + amr: ["mfa"]
  → Handler verifies claims.amr contains "mfa"
  → Token Vault exchange → GitHub API → success
```

### CIBA (Critic)
```
User → Frontend (click Background Task) → POST /api/agents/critic/review
  → Axum JWT middleware: check scope "invoke:critic" ✓
  → Handler → ciba_orchestrator::trigger_and_poll_ciba(user_id, message)
    → POST https://{auth0_domain}/bc-authorize
      login_hint: <user's Auth0 sub>
      binding_message: "Critic Agent requests permission..."
    ← { auth_req_id, interval: 5, expires_in: 300 }
    → LOOP every 5s: POST https://{auth0_domain}/oauth/token
      grant_type: urn:openid:params:grant-type:ciba
      auth_req_id: <from above>
      → "authorization_pending" → continue
      → success → return access_token
    Meanwhile: Auth0 Guardian sends push to user's phone
    User taps "Approve" on phone
    → Next poll returns access_token
  ← { agent: "critic", status: "success", ciba_authorized: true }
```

## Nyckelkonfigurationer

### Auth0 Custom Scopes (Backend API)
- `invoke:analyst`
- `invoke:creativist`
- `invoke:critic`
- `publish:article` (triggers step-up)

### Auth0 Grant Types (M2M App)
- `authorization_code`
- `refresh_token`
- `client_credentials`
- `urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token`

### Frontend Requested Scopes
```
openid profile email offline_access
read:me:connected_accounts create:me:connected_accounts
invoke:analyst invoke:creativist invoke:critic publish:article
```
