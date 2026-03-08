# AUTH0_SETUP.md — Steg-för-steg Auth0-tenantskonfiguration

> Alla steg måste utföras manuellt i Auth0 Dashboard innan applikationen fungerar.

## Förutsättningar

- Auth0-konto (gratis tier räcker för utveckling)
- Auth0-tenant (helst EU-region, `.eu.auth0.com`)
- Google Cloud Console-konto (för Google OAuth)
- GitHub Developer Settings (för GitHub OAuth)

---

## Steg 1: Frontend Application

1. **Dashboard** → Applications → Applications → **Create Application**
2. Namn: `Frankenstein AI Frontend`
3. Typ: **Regular Web Application**
4. Inställningar:
   - **Allowed Callback URLs:**
     ```
     https://app.gracestack.se/api/auth/callback,
     http://localhost:3000/api/auth/callback
     ```
   - **Allowed Logout URLs:**
     ```
     https://app.gracestack.se,
     http://localhost:3000
     ```
   - **Allowed Web Origins:**
     ```
     https://app.gracestack.se,
     http://localhost:3000
     ```
5. **Advanced Settings** → Grant Types:
   - [x] Authorization Code
   - [x] Refresh Token
   - [x] CIBA (Client-Initiated Backchannel Authentication)
6. Spara **Client ID** och **Client Secret** → `frontend/.env.local`

### Env-variabler att fylla i (frontend/.env.local):
```env
AUTH0_SECRET="<kör: openssl rand -hex 32>"
AUTH0_BASE_URL="https://app.gracestack.se"       # eller http://localhost:3000 för dev
AUTH0_ISSUER_BASE_URL="https://<TENANT>.eu.auth0.com"
AUTH0_CLIENT_ID="<från steg 1.6>"
AUTH0_CLIENT_SECRET="<från steg 1.6>"
AUTH0_AUDIENCE="https://api.gracestack.se"
NEXT_PUBLIC_API_URL="https://app.gracestack.se/api"  # eller http://localhost:3000/api
```

---

## Steg 2: Backend Custom API

1. **Dashboard** → Applications → APIs → **Create API**
2. Namn: `Frankenstein Backend API`
3. **Identifier (Audience):** `https://api.gracestack.se`
4. **Signing Algorithm:** RS256
5. **Scopes-fliken** → Lägg till:

| Scope | Beskrivning |
|-------|------------|
| `invoke:analyst` | Permits execution of data analysis operations |
| `invoke:creativist` | Permits execution of content generation operations |
| `invoke:critic` | Permits execution of review and destructive operations |
| `publish:article` | High-value scope triggering step-up authentication |

---

## Steg 3: Machine-to-Machine (M2M) Application

1. **Dashboard** → Applications → Applications → **Create Application**
2. Namn: `Frankenstein API Client`
3. Typ: **Machine to Machine Application**
4. Auktorisera till: **Auth0 Management API** (minst `read:users` scope)
5. Spara **Client ID** och **Client Secret** → `backend/.env`

### KRITISKT: Aktivera Token Vault Grant Type

Auth0 Dashboard stödjer ej detta grant type i UI. Kör manuellt via Management API:

```bash
# Hämta först en Management API-token via M2M app
curl --request PATCH \
  --url 'https://<TENANT>.eu.auth0.com/api/v2/clients/<M2M_CLIENT_ID>' \
  --header 'authorization: Bearer <MANAGEMENT_API_TOKEN>' \
  --header 'content-type: application/json' \
  --data '{
    "grant_types": [
      "authorization_code",
      "refresh_token",
      "client_credentials",
      "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token"
    ]
  }'
```

### Env-variabler att fylla i (backend/.env):
```env
DATABASE_URL="postgres://postgres:password@localhost:5432/frankenstein"
AUTH0_DOMAIN="<TENANT>.eu.auth0.com"
AUTH0_AUDIENCE="https://api.gracestack.se"
AUTH0_M2M_CLIENT_ID="<från steg 3.5>"
AUTH0_M2M_CLIENT_SECRET="<från steg 3.5>"
RUST_LOG="info,frankenstein_api=debug"
PORT="8080"
```

---

## Steg 4: My Account API & Connected Accounts

1. **Dashboard** → Settings → Kontrollera att **My Account API** är aktiverad
2. **Dashboard** → Applications → `Frankenstein AI Frontend` → APIs-fliken
3. Auktorisera **My Account API** med scopes:
   - `read:me:connected_accounts`
   - `create:me:connected_accounts`
   - `delete:me:connected_accounts`

---

## Steg 5: Social Connections

### Google OAuth2
1. **Dashboard** → Authentication → Social → **google-oauth2**
2. Sätt **Client ID** och **Client Secret** från Google Cloud Console
3. Scopes att begära:
   - `openid profile email`
   - `https://www.googleapis.com/auth/drive.readonly`
4. **KRITISKT:** Under Connection Settings, aktivera **offline_access**
   - Detta gör att Auth0 sparar Google refresh token i Token Vault
5. Aktivera för applikationen `Frankenstein AI Frontend`

### GitHub
1. **Dashboard** → Authentication → Social → **github**
2. Sätt **Client ID** och **Client Secret** från GitHub Developer Settings
3. Scopes: `repo`, `read:user`, `gist`
4. **KRITISKT:** Aktivera **offline_access**
5. Aktivera för applikationen `Frankenstein AI Frontend`

---

## Steg 6: Multi-Factor Authentication (Step-Up)

1. **Dashboard** → Security → Multi-factor Auth
2. Aktivera **Auth0 Guardian** (Push Notifications)
3. Under Policy, välj **Adaptive** eller **Always** (för demo: Always)
4. Användaren måste registrera sin enhet via Guardian-appen

---

## Steg 7: Post-Login Action (Step-Up Enforcement)

1. **Dashboard** → Actions → Library → **Build Custom**
2. Namn: `Enforce Step-Up for High Value Scopes`
3. Trigger: **Post-Login**
4. Klistra in exakt denna kod:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const requestedScopes = event.transaction?.requested_scopes || [];
  if (requestedScopes.includes('publish:article')) {
    api.multifactor.enable('any', { allowRememberBrowser: false });
  }
};
```

5. **Deploy** → **Bind** till Login Flow (dra in i flödet)

---

## Steg 8: CIBA Configuration

1. **Dashboard** → Applications → `Frankenstein AI Frontend`
2. **Advanced Settings** → Grant Types → Aktivera **CIBA**
3. Notification channel: mappad till **Auth0 Guardian**
4. CIBA kräver att användaren har Guardian-appen installerad

---

## Verifikationschecklista

| # | Steg | Status |
|---|------|--------|
| 1 | Frontend App skapad med korrekt callback URLs | ⬜ |
| 2 | Backend API skapad med audience `https://api.gracestack.se` | ⬜ |
| 3 | Custom scopes definierade (invoke:analyst, invoke:creativist, invoke:critic, publish:article) | ⬜ |
| 4 | M2M App skapad med Token Vault grant type | ⬜ |
| 5 | My Account API aktiverad + scopes auktoriserade | ⬜ |
| 6 | Google OAuth2 connection med offline_access | ⬜ |
| 7 | GitHub connection med offline_access | ⬜ |
| 8 | Auth0 Guardian (MFA) aktiverad | ⬜ |
| 9 | Post-Login Action deployad och bunden | ⬜ |
| 10 | CIBA grant aktiverad | ⬜ |
| 11 | frontend/.env.local ifylld med riktiga värden | ⬜ |
| 12 | backend/.env ifylld med riktiga värden | ⬜ |
