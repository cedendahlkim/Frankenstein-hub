# DEPLOYMENT.md — VPS Deploy-instruktioner

## Serverinfo

| Nyckel | Värde |
|--------|-------|
| **IP** | 95.217.7.221 |
| **Domän** | app.gracestack.se |
| **DNS** | Loopia |
| **OS** | Ubuntu (antagen) |
| **Deploy-user** | `deploy` |
| **Repo-path** | `/var/www/frankenstein-hub/` |
| **Backend port** | 8080 |
| **Frontend port** | 3000 |

---

## Steg 1: Förutsättningar på servern

```bash
# SSH in
ssh deploy@95.217.7.221

# Installera Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Installera Node.js 18+ (via nvm eller nodesource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installera PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Skapa databas
sudo -u postgres createdb frankenstein
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';"
```

---

## Steg 2: Klona och bygg

```bash
cd /var/www
git clone <REPO_URL> frankenstein-hub
cd frankenstein-hub

# Backend
cd backend
cp .env.example .env   # Fyll i riktiga värden
cargo build --release

# Frontend
cd ../frontend
cp .env.local.example .env.local   # Fyll i riktiga värden
npm install
npm run build
```

---

## Steg 3: Systemd-tjänster

```bash
# Kopiera service-filer
sudo cp /var/www/frankenstein-hub/infra/frankenstein-api.service /etc/systemd/system/
sudo cp /var/www/frankenstein-hub/infra/frankenstein-web.service /etc/systemd/system/

# Ladda om och starta
sudo systemctl daemon-reload
sudo systemctl enable frankenstein-api frankenstein-web
sudo systemctl start frankenstein-api frankenstein-web

# Verifiera
sudo systemctl status frankenstein-api
sudo systemctl status frankenstein-web

# Loggar
sudo journalctl -u frankenstein-api -f
sudo journalctl -u frankenstein-web -f
```

---

## Steg 4: Nginx

```bash
# Kopiera nginx-config
sudo cp /var/www/frankenstein-hub/infra/nginx-app.gracestack.se.conf \
        /etc/nginx/sites-available/app.gracestack.se

# Symlink
sudo ln -s /etc/nginx/sites-available/app.gracestack.se \
           /etc/nginx/sites-enabled/

# Testa och ladda om
sudo nginx -t
sudo systemctl reload nginx
```

---

## Steg 5: SSL med Certbot

```bash
# Installera certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Hämta och konfigurera SSL
sudo certbot --nginx -d app.gracestack.se

# Auto-renew (brukar konfigureras automatiskt)
sudo certbot renew --dry-run
```

---

## Steg 6: DNS (Loopia)

Kontrollera att följande DNS-poster finns:

| Typ | Namn | Värde |
|-----|------|-------|
| A | app | 95.217.7.221 |

---

## Felsökning

### Backend startar inte
```bash
sudo journalctl -u frankenstein-api -n 50
# Vanliga problem:
# - DATABASE_URL fel → kontrollera .env
# - Port 8080 upptagen → lsof -i :8080
# - Rust compile error → cargo build --release i backend/
```

### Frontend startar inte
```bash
sudo journalctl -u frankenstein-web -n 50
# Vanliga problem:
# - npm run build misslyckades → kör manuellt
# - .env.local saknas eller felkonfigurerad
# - Port 3000 upptagen → lsof -i :3000
```

### Nginx 502 Bad Gateway
```bash
# Backend eller frontend ej startad
sudo systemctl status frankenstein-api
sudo systemctl status frankenstein-web
# Testa direkt anslutning
curl http://localhost:8080/health
curl http://localhost:3000
```

### Auth0-relaterade fel
- **Callback URL mismatch** → Kontrollera Allowed Callback URLs i Auth0 Dashboard
- **Invalid audience** → Kontrollera AUTH0_AUDIENCE matchar API identifier
- **Token exchange failed** → Kontrollera M2M client har Token Vault grant type

---

## Uppdatera efter deploy

```bash
cd /var/www/frankenstein-hub
git pull origin main

# Backend
cd backend && cargo build --release
sudo systemctl restart frankenstein-api

# Frontend
cd ../frontend && npm install && npm run build
sudo systemctl restart frankenstein-web
```
