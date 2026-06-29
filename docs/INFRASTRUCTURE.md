# ModEval Infrastructure

## Hosting Overview

The application is deployed across two providers: Vercel hosts the frontend static files, while Hetzner VPS hosts the backend API. Cloudflare provides DNS, reverse proxy, and CDN services for both.

| Layer | Provider | URL |
|---|---|---|
| Frontend (static) | Vercel | modeval.bynipun.com |
| Backend API (Flask/Gunicorn) | Hetzner VPS | modeval-api.bynipun.com |
| Reverse Proxy / CDN | Cloudflare | bynipun.com |
| SSL (origin) | Let's Encrypt via Certbot | Auto-renewing |
| Secrets | Doppler | Project: modeval, Config: prd |

---

## Server Details

- Provider: Hetzner Cloud
- Plan: CX23 (2 vCPU, 4 GB RAM, 40 GB NVMe SSD)
- OS: Ubuntu 24.04.4 LTS
- IP: 178.105.93.92
- Location: Nuremberg, Germany
- SSH user: nipun (root login disabled)
- App directory: `/home/nipun/apps/modeval`

---

## How the App Runs (Split Architecture)

**Frontend:**
```
User → Cloudflare Edge → Vercel → index.html / app.js / style.css
```

**API:**
```
app.js → Cloudflare Edge → Nginx (modeval-api.bynipun.com:443) → Gunicorn (127.0.0.1:5000) → Flask
```

The Flask backend runs under Gunicorn, managed by systemd, with secrets injected by Doppler. The frontend is a static site served by Vercel. All API calls from the frontend are made to `https://modeval-api.bynipun.com` with CORS enabled.

**systemd service:** `/etc/systemd/system/modeval.service`
- Runs as user `nipun`
- Auto-starts on boot
- Auto-restarts 5 seconds after any crash
- Doppler injects secrets before Flask starts

**Nginx config:** `/etc/nginx/sites-available/modeval`
- Routes `modeval-api.bynipun.com` to `127.0.0.1:5000`
- Certbot manages HTTPS — certificate at `/etc/letsencrypt/live/modeval-api.bynipun.com/`
- All requests are reverse proxied to Gunicorn/Flask for API processing

**No cold starts.** The app runs permanently. There is no spin-down behaviour. Any previous references to Render cold starts are no longer applicable.

---

## Deployment — How Code Gets to the Server

Pushing to the `main` branch on GitHub triggers automatic deployment via GitHub Actions.

**Workflow file:** `.github/workflows/deploy.yml`

**What it does on every push to main:**
1. SSHes into the server as `nipun`
2. Runs `git pull origin main` in `/home/nipun/apps/modeval`
3. Runs `sudo systemctl restart modeval`

**Total deploy time:** 15-30 seconds. App downtime during restart: under 3 seconds.

**GitHub secrets required** (already configured):
- `VPS_HOST` — server IP
- `VPS_USER` — `nipun`
- `VPS_SSH_KEY` — dedicated ed25519 private key for GitHub Actions

**Note for coding agents:** If a deployment requires installing new Python packages (`requirements.txt` changes), the GitHub Actions workflow does not currently run `pip install` automatically. Nipun must SSH in and run:
```bash
cd /home/nipun/apps/modeval
source venv/bin/activate
pip install -r backend/requirements.txt
deactivate
sudo systemctl restart modeval
```

---

## Secrets Management

Secrets are stored in Doppler under project `modeval`, config `prd`.

**Currently configured secrets:**
- `OPENAI_API_KEY` — OpenAI moderation model
- `HF_API_KEY` — HuggingFace inference API (open source models)
- `HIVE_API_KEY` — The Hive AI text moderation (replaced Perspective API)
- `ANTHROPIC_API_KEY` — Claude Haiku interpretation layer (alignment assessment + AI summary)
- `AZURE_CS_KEY` — Microsoft Azure Content Safety API key
- `AZURE_CS_ENDPOINT` — Microsoft Azure Content Safety API endpoint URL
- `GOOGLE_NLP_KEY` — Google Cloud Natural Language API key

Adding a new secret to Doppler takes effect on the next `systemctl restart modeval` — no server changes needed.

---

## Cloudflare Configuration

Cloudflare acts as DNS provider and reverse proxy for both modeval.bynipun.com (fronted by Vercel) and modeval-api.bynipun.com (Hetzner backend API).

**Frontend (modeval.bynipun.com):**
- DNS: CNAME record pointing to Vercel's edge (provided by Vercel on project creation)
- Cloudflare proxies requests to Vercel

**API (modeval-api.bynipun.com):**
- DNS: A record pointing to Hetzner VPS IP (178.105.93.92)
- Cloudflare proxies requests to Nginx on the Hetzner origin
- Orange cloud enabled — real server IP hidden from public DNS
- SSL/TLS mode: Full (Strict) — validates origin Let's Encrypt cert
- Always Use HTTPS: enabled — HTTP redirected to HTTPS at edge
- **Note:** The subdomain is `modeval-api.bynipun.com` (not `api.modeval.bynipun.com`) because Cloudflare's free plan wildcard SSL cert covers `*.bynipun.com` (one level deep) but not `*.modeval.bynipun.com` (two levels deep)

**Rate limiting integration:**
- Nginx rate limiting uses `$http_cf_connecting_ip` header (not `$remote_addr`) to get the real visitor IP through Cloudflare's proxy layer
- Analyze endpoints: 10 requests/minute per IP
- All other routes: 60 requests/minute per IP

### Stale DNS Records to Clean Up

The following DNS record was created during migration and is no longer needed — it should be deleted from Cloudflare DNS:
- A record: `api.modeval.bynipun.com` → `178.105.93.92`

The active API subdomain is `modeval-api.bynipun.com` (one level deep, covered by wildcard cert).

### Post-Migration Nginx Changes Required

After the Vercel migration, the following manual steps are required on the Hetzner VPS:

1. **Update Nginx to respond to modeval-api.bynipun.com:**

   In `/etc/nginx/sites-available/modeval`, change the `server_name` directive:
   ```
   server_name modeval-api.bynipun.com;
   ```

   Then test and reload:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **Update or create Let's Encrypt certificate for the API subdomain:**

   Run Certbot to issue a certificate for the new subdomain:
   ```bash
   sudo certbot --nginx -d modeval-api.bynipun.com
   ```

3. **Add DNS record in Cloudflare for api subdomain:**

   Create an A record in Cloudflare DNS:
   - Name: `api`
   - Content (IPv4): `178.105.93.92`
   - Proxy status: Proxied (orange cloud)

4. **Update DNS for main domain:**

   In Cloudflare, change the `modeval` A record to a CNAME pointing to Vercel's edge domain (provided by Vercel when the project is created). This typically looks like `modeval-<your-username>.vercel.app` or similar.

---

## Checking App Health (SSH Commands)

```bash
# Check if the app is running
sudo systemctl status modeval

# View recent logs (last 50 lines)
sudo journalctl -u modeval -n 50

# Restart the app
sudo systemctl restart modeval

# Test Nginx config before reloading
sudo nginx -t

# Reload Nginx after config changes
sudo systemctl reload nginx

# Verify Doppler secrets are accessible
doppler secrets
```

---

## When Something Breaks — Diagnosis Flow

**App returns 502 Bad Gateway:**
Nginx is running but Flask is not. Check: `sudo systemctl status modeval` and `sudo journalctl -u modeval -n 50`.

**App not reachable at all:**
Either Nginx is down or the firewall blocked something. Check: `sudo systemctl status nginx`.

**Models showing unavailable after a code change:**
Likely a Python error during startup, or a new dependency not installed. Check logs: `sudo journalctl -u modeval -n 50`. If new packages were added, run pip install manually (see Deployment section above).

**GitHub Actions deploy failing:**
Check the Actions tab in the GitHub repo. Common causes: SSH key issue, sudo permission missing, or git conflict on the server.

**SSL certificate warning:**
Unlikely — Certbot auto-renews. If it happens: `sudo certbot renew --dry-run` to test, then `sudo certbot renew` to force renewal.

---

## Python Environment

- Python version: 3.12.3
- Virtual environment: `/home/nipun/apps/modeval/venv/`
- Dependencies installed from: `backend/requirements.txt`
- Gunicorn binary: `/home/nipun/apps/modeval/venv/bin/gunicorn`

The venv is not committed to git. It is created fresh on the server and populated from `requirements.txt`.

---

## Adding New API Keys

1. Add the secret to Doppler dashboard (project: modeval, config: prd)
2. SSH into server and restart the app:
```bash
sudo systemctl restart modeval
```
3. No code changes needed — the app already checks for these keys at startup and enables the corresponding model if the key is present.
