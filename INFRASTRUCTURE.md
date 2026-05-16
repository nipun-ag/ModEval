# ModEval Infrastructure

## Hosting Overview

The backend is no longer on Render. It is self-hosted on a Hetzner VPS. The frontend remains on Vercel unchanged.

| Layer | Provider | URL |
|---|---|---|
| Backend (Flask/Gunicorn) | Hetzner VPS | Internal — accessed via modeval.bynipun.com |
| Frontend (static) | Vercel | modeval.bynipun.com |
| Domain/DNS | Cloudflare | bynipun.com |
| SSL | Let's Encrypt via Certbot | Auto-renewing |
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

## How the Backend Runs

The Flask app runs under Gunicorn, managed by systemd, with secrets injected by Doppler.

```
Request → Nginx (port 443) → Gunicorn (127.0.0.1:5000) → Flask
```

**systemd service:** `/etc/systemd/system/modeval.service`
- Runs as user `nipun`
- Auto-starts on boot
- Auto-restarts 5 seconds after any crash
- Doppler injects secrets before Flask starts

**Nginx config:** `/etc/nginx/sites-available/modeval`
- Routes `modeval.bynipun.com` to `127.0.0.1:5000`
- Certbot manages HTTPS — certificate at `/etc/letsencrypt/live/modeval.bynipun.com/`

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

**Not yet configured (models show "Coming Soon"):**
- `AZURE_CS_KEY` + `AZURE_CS_ENDPOINT`
- `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `AWS_REGION`
- `GOOGLE_NLP_KEY`

Adding a new secret to Doppler takes effect on the next `systemctl restart modeval` — no server changes needed.

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
