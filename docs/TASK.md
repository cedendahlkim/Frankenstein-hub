# TASK.md — Frankenstein AI: Multi-Agent Authorization Hub

## Hackathon

- **Namn:** "Authorized to Act: Auth0 for AI Agents"
- **Pris:** $10,000 grand prize
- **Submission:** Devpost
- **Demovideo:** 3 minuter (se Phase 7 nedan)

## Kärnproblem

Monolitiska AI-agenter med hårdkodade API-nycklar → "Confused Deputy"-sårbarhet. Om en agent komprometteras via prompt injection, äventyras hela infrastrukturen.

## Lösning

**Frankenstein AI** — tre autonoma sub-agenter (Analyst, Creativist, Critic) som var och en autentiseras och auktoriseras oberoende via Auth0. Zero Trust-arkitektur.

## De tre agenterna

| Agent | Extern Provider | Scope | Auth-mekanism |
|-------|----------------|-------|---------------|
| **Analyst** | Google Workspace (Drive/Sheets) | `invoke:analyst` | Token Vault Exchange (RFC 8693) |
| **Creativist** | GitHub | `invoke:creativist`, `publish:article` | Token Vault + Step-Up MFA |
| **Critic** | System (intern) | `invoke:critic` | CIBA Background Consent (push notification) |

## Tre kärnfunktioner att demonstrera

### 1. Auth0 Token Vault (RFC 8693)
- Backend byter användarens Auth0-session mot en **ephemeral** downstream provider-token (Google/GitHub)
- Inga long-lived credentials sparas i applikationens databas
- Implementerat i `backend/src/services/token_vault.rs`
- Grant type: `urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token`

### 2. Step-Up Authentication (MFA)
- Scope `publish:article` → Auth0 Post-Login Action triggar MFA-utmaning
- Backend returnerar HTTP 403 om scope saknas → Frontend fångar och redirectar till MFA
- Frontend `StepUpModal.tsx` visar dialog innan redirect
- Auth0 Action: "Enforce Step-Up for High Value Scopes"

### 3. CIBA (Client-Initiated Backchannel Authentication)
- Critic Agent kör destruktiva bakgrundsuppgifter (t.ex. ta bort repo)
- Backend initierar CIBA-request → Auth0 skickar push via Guardian
- Backend pollar `/oauth/token` tills användaren godkänner på mobilen
- Implementerat i `backend/src/services/ciba_orchestrator.rs`

## Tech Stack

| Komponent | Teknologi |
|-----------|-----------|
| **Backend** | Rust, Axum 0.7, SQLx, jsonwebtoken, reqwest |
| **Frontend** | Next.js 14.2.25, React 18, Tailwind CSS 3.4, Lucide icons |
| **Auth** | Auth0 (@auth0/nextjs-auth0 v3.x) |
| **Databas** | PostgreSQL (agent_metadata tabell) |
| **Deploy** | VPS 95.217.7.221, Nginx reverse proxy, Certbot SSL |
| **Domän** | app.gracestack.se (Loopia DNS) |

## Bedömningskriterier (Devpost)

1. **Insight Value** — Hur väl förklaras Confused Deputy-problemet
2. **Potential Impact** — Skalbarhet, verklig tillämpning
3. **Technical Implementation** — Korrekt användning av Auth0-features
4. **Demo Quality** — 3-minuters video med tydlig UX + backend-loggar

## Demovideo-script (3 min)

| Tid | Scen | Vad visas |
|-----|------|-----------|
| 0:00-0:30 | Context | Förklara Confused Deputy, visa dashboard med 3 agenter |
| 0:30-1:15 | Token Vault | Klicka "Connect Google" → OAuth consent → Analyst grön. Split-screen: DB visar bara metadata |
| 1:15-2:00 | RFC 8693 Exchange | Klicka "Execute Task" → Rust-loggar visar token exchange POST → Google API-svar |
| 2:00-3:00 | Step-Up + CIBA | Creativist "Publish" → 403 → MFA-prompt. Critic "Background Task" → polling → Guardian push → approve |

## Devpost Blog-outline

**Titel:** "Deconstructing the Confused Deputy: Zero Trust Authorization in Multi-Agent AI Systems using Auth0 Token Vault"

Sektioner:
1. Introduction (The Monolith Crisis) — Confused Deputy anti-pattern
2. Token Vault Paradigm Shift (RFC 8693) — Ephemeral tokens, IdP som krypto-ansvarig
3. Dual-Layer Human-in-the-Loop — Step-Up (synkron) + CIBA (asynkron)

## Käll-specifikation

Originaldokumentet finns på: `C:\Users\kim\Desktop\hackaton3.txt` (631 rader)
