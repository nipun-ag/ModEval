# ModEval — Complete Technical Architecture

**Last Updated:** July 2026  
**Status:** Live at [modeval.bynipun.com](https://modeval.bynipun.com)

---

## Project Folder Structure

```
modeval/
├── backend/
│   ├── app.py                          Flask entry point, blueprint registration (API-only)
│   ├── config.py                       Centralized config: API keys, thresholds, policies
│   ├── requirements.txt                Python dependencies (Flask, Gunicorn, OpenAI SDK, dotenv)
│   ├── routes/
│   │   ├── analyze.py                  POST /analyze route, model orchestration, AI summary generation
│   │   └── models.py                   GET /models route, credential-presence check returning active/total counts
│   ├── models/
│   │   ├── hive_moderation.py          Hive Moderation API wrapper
│   │   ├── azure_content_safety.py     Azure Content Safety wrapper
│   │   ├── google_nlp.py               Google Cloud Natural Language wrapper
│   │   ├── openai_moderation.py        OpenAI Moderation API wrapper
│   │   ├── hf_toxic_bert.py            Unitary toxic-bert model wrapper
│   │   ├── hf_roberta_offensive.py     Cardiff NLP offensive language detector
│   │   ├── hf_hate_speech.py           Facebook FAIR hate speech detector
│   │   └── hf_bias.py                  Valurank bias detector
│   └── engine/
│       ├── context_engine.py           Fixed threshold calculation (review=0.40, remove=0.70); no platform modifiers
│       ├── normalizer.py               Raw model output → unified schema conversion
│       ├── policy_engine.py            Policy rule extraction and alignment scoring
│       ├── comparison.py               Disagreement detection and insight building
│       └── explainer.py                Per-model result interpretation and explanation text
├── frontend/                           React/Vite/TypeScript app (Vercel)
├── docs/
│   └── ARCHITECTURE.md                 This file — complete technical reference
└── README.md                           Public-facing project overview
```

---

## API Endpoints

### POST /analyze
**Purpose:** Analyze a single text input across 8 moderation models (3 enterprise APIs + 4 HuggingFace + OpenAI).

**Request Body:**
```json
{
  "text": "string (1-500 characters, required)",
  "platform": "Reddit | Discord | Facebook | Instagram | Custom (default: Reddit)",
  "custom_policy_text": "string (optional, used only when platform='Custom')"
}
```

**Platform Mapping:**
All platforms use identical fixed base thresholds (review=0.40, remove=0.70). Platform selection only determines which policy rules Claude Haiku uses for alignment assessment:
- **Reddit**: Reddit content policy
- **Discord**: Discord community guidelines
- **Facebook**: Facebook community standards
- **Instagram**: Instagram community standards (unified Nov 2024)
- **Custom**: user-provided policy text

**Response Body:**
```json
{
  "results": [
    {
      "model": "string — model display name",
      "top_category": "string — highest-confidence violation category",
      "confidence": "0.0-1.0 float, 4 decimal places",
      "action": "Allow | Review | Remove | Disabled | Error",
      "flagged": "boolean — true if action != Allow",
      "aligned": "boolean — true if model verdict matches platform policy (active/error rows)",
      "alignment_reason": "string — content-aware explanation from Claude Haiku (active rows)",
      "explanation": "string — plain English explainer text",
      "error": "string (optional) — only on model failures",
      "disabled": "boolean (optional) — true when credentials are not configured"
    },
    ...up to 8 models total
  ],
  "disagreements": {
    "action_mismatch": ["list of model names"],
    "category_mismatch": ["list of model names"]
  },
  "insights": {
    "strictest_model": {"model": "string", "action": "string"},
    "most_lenient_model": {"model": "string", "action": "string"},
    "consensus_recommendation": "Allow | Review | Remove | No Consensus"
  },
  "ai_analysis": {
    "disagreement_explanation": "string — why models disagreed (empty if consensus)",
    "risk_narrative": "string — analyst reasoning (finding tag in UI comes from consensus_recommendation)",
    "context_sensitivity": "string — whether human review is needed",
    "contested_category": "string — most disputed category across models"
  }
}
```

Notes:
- `raw_scores` is computed during normalization then stripped before the JSON response (`result.pop("raw_scores", None)` in `build_response()`).
- Claude may return an internal `alignment_score` during alignment evaluation; only `aligned` and `alignment_reason` are copied onto result objects. `alignment_score` is never included in the API response.

**Status Codes:**
- 200 OK — Analysis complete, all fields valid
- 400 Bad Request — Missing or invalid text input
- 500 Server Error — Model inference or AI analysis failure (results still returned)

---

### GET /models
**Purpose:** Return active and total model counts based on credential presence only. No inference calls.

**Response Body:**
```json
{
  "active_count": 8,
  "total_count": 8
}
```

`active_count` increments for each model whose required credentials are present in the environment:
- `HIVE_API_KEY` → Hive Moderation
- `AZURE_CS_KEY` + `AZURE_CS_ENDPOINT` (both required) → Azure Content Safety
- `GOOGLE_NLP_KEY` → Google NLP
- `OPENAI_API_KEY` → OpenAI Moderation
- `HF_API_KEY` → counts 4 HuggingFace models (toxic-bert, RoBERTa offensive, Hate Speech, Bias Detector)

Called on page load through `frontend/src/lib/api.ts`; `frontend/src/App.tsx` stores the model count label and passes it to `TopBar`.

---

### GET /health
**Purpose:** Uptime monitoring endpoint.

**Response:**
```json
{"status": "ok"}
```

---

## Model Details

**8 models total, running in parallel:**
- 3 Enterprise APIs (optional, credentials required)
- 4 HuggingFace open-source models (share one credential gate)
- 1 OpenAI proprietary model (requires API key)

Models without configured credentials are gracefully disabled and filtered from consensus/disagreement/insight calculations. The decision matrix renders them in two tiers for clarity.

### Enterprise APIs (Optional, Tier 1)

These are third-party cloud APIs that require credentials. If credentials are missing, the model shows "Not Configured" with no analysis failure.

#### 1. Hive Moderation (The Hive AI)
- **API:** The Hive AI V3 Text Moderation API
- **Endpoint:** POST https://api.thehive.ai/api/v2/task/sync
- **Architecture:** Purpose-built text moderation API (REST)
- **Auth Method:** Bearer token via `Authorization: Token {HIVE_API_KEY}` header
- **Safety Dimensions:** Sexual, Violence, Hate, Bullying, Spam
- **Output Schema:** Multi-class output with class name and float score (0-1) per category
- **Strengths:** Purpose-built for T&S pipelines, instant API access, flexible pricing, covers 5 core violation categories
- **Limitations:** 100 req/day on V3 free tier, limited to 1024 characters per request
- **Credentials:** `HIVE_API_KEY` environment variable

#### 2. Azure Content Safety (Microsoft)
- **API:** Microsoft Azure Content Safety API
- **Architecture:** Proprietary neural classifier
- **Training Data:** Microsoft proprietary enterprise dataset
- **Safety Dimensions:** Hate, Violence, Sexual, Self-Harm (severity scores 0-6)
- **Output Schema:** 4 categories with severity normalized to 0-1 confidence
- **Strengths:** Enterprise SLA, SOC2 compliant, designed for T&S pipelines
- **Limitations:** Only 4 categories, paid service
- **Credentials:** `AZURE_CS_KEY` and `AZURE_CS_ENDPOINT` environment variables

#### 3. Google NLP (Google Cloud)
- **API:** Google Cloud Natural Language API moderateText endpoint
- **Architecture:** REST API (Google proprietary)
- **Training Data:** Google proprietary dataset
- **Safety Dimensions:** 8 categories including Toxic, Sexual, Weapons, Illicit Drugs
- **Output Schema:** Multi-label moderation categories with confidence (0-1)
- **Strengths:** Broader category coverage (8 dimensions), Google Cloud integration
- **Limitations:** Paid service, newer moderateText endpoint less documented
- **Credentials:** `GOOGLE_NLP_KEY` environment variable

### Open Source & Proprietary Models (Tier 2)

These models run when their shared provider credentials are configured. If credentials are missing, the API returns {"disabled": true, "action": "Disabled"} for that model and excludes it from consensus math.

#### 4. OpenAI Moderation
- **API:** OpenAI Moderation API
- **Architecture:** Proprietary classification model (not disclosed)
- **Training Data:** Internal OpenAI dataset
- **Safety Dimensions:** Multiple (sexual, violence, self-harm, hate, harassment, harassment/threatening, illegal, etc.)
- **Output Schema:** Multi-label scores for 10+ violation types
- **Strengths:** Production-grade, high accuracy, covers edge cases OpenAI has seen
- **Limitations:** Proprietary, may not align with platform-specific policies

#### 5. toxic-bert (HuggingFace: unitary/toxic-bert)
- **Architecture:** BERT (12-layer, 768-hidden, 12-head)
- **Creator:** Unitary AI
- **Training Data:** Jigsaw Toxic Comments dataset (Wikipedia talk page comments)
- **Safety Dimension:** General toxicity baseline
- **Output Schema:** Multi-label scores for `toxic`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack`
- **Strengths:** Widely used in production, covers 6 toxicity dimensions, general-purpose
- **Limitations:** Trained on formal Wikipedia comments, may underperform on informal slang

#### 6. RoBERTa Offensive (HuggingFace: cardiffnlp/twitter-roberta-base-offensive)
- **Architecture:** RoBERTa-base (24-layer, 1024-hidden, 16-head)
- **Creator:** Cardiff NLP
- **Training Data:** Twitter / SemEval-2019 Task 6 (offensive language identification)
- **Safety Dimension:** Social media offensive language
- **Output Schema:** Multi-class scores for `NOT OFFENSIVE` (label 0), `OFFENSIVE` (label 1), `HATE` (label 2)
- **Strengths:** Twitter-specific training, excellent for slang and informal tone
- **Limitations:** May overfit to Twitter conventions, may miss platform-specific patterns from other networks

#### 7. RoBERTa Hate Speech (HuggingFace: facebook/roberta-hate-speech-dynabench-r4-target)
- **Architecture:** RoBERTa-base
- **Creator:** Facebook AI Research
- **Training Data:** DynaBench R4 — adversarially collected hate speech examples
- **Safety Dimension:** Identity-based hate speech
- **Output Schema:** Multi-class scores for `nothate` (label 0), `hate` (label 1), `offensive_language` (label 2)
- **Strengths:** Adversarial training makes it robust to evasion, focuses on hate not general offense
- **Limitations:** Binary hate/not-hate less granular, only 3-class output

#### 8. DistilRoBERTa Bias (HuggingFace: valurank/distilroberta-bias)
- **Architecture:** DistilRoBERTa (6-layer, 768-hidden, 12-head) — 40% smaller than RoBERTa
- **Creator:** Valurank
- **Training Data:** Wikipedia Neutrality Comments (WNC) — real editorial decisions to remove biased language
- **Safety Dimension:** Non-neutral language and bias detection
- **Output Schema:** Multi-label scores for `biased` and `neutral`
- **Strengths:** Unique training methodology using real editorial decisions, detects subtle bias
- **Limitations:** May flag strongly opinionated but legitimate content, less suitable for opinion-heavy platforms

---

## Moderation Thresholds & Context Engine

### Base Thresholds (config.py)
```python
BASE_REVIEW_THRESHOLD = 0.40      # Confidence threshold for Review action
BASE_REMOVE_THRESHOLD = 0.70      # Confidence threshold for Remove action
```

### Threshold Calculation

All platforms use fixed base thresholds. No modifiers are applied.

```
review_threshold = BASE_REVIEW_THRESHOLD (0.40)
remove_threshold = BASE_REMOVE_THRESHOLD (0.70)
```

`calculate_context_adjustment()` takes no parameters and always returns these fixed values. Platform-specific judgment is handled by Claude Haiku alignment assessment, not by threshold adjustment.

---

## Policy Alignment Scoring

### AI-Powered Alignment (Primary)
`evaluate_alignment_with_ai()` in `policy_engine.py` makes a single batched Claude Haiku (claude-haiku-4-5-20251001) call to assess alignment for all active models simultaneously.

**Input to Claude:**
- Original text being analyzed (for content-aware assessment)
- All active model results (model name, top_category, confidence, system_action)
- Platform-specific policy instructions (zero-tolerance categories, deprioritized categories)

**Output from Claude (JSON array):**
```json
[
  {
    "model": "Hive Moderation",
    "aligned": true,
    "alignment_reason": "Hive correctly flagged harassment at 0.87 confidence, aligning with Discord's zero-tolerance for harassment/threatening."
  },
  ...
]
```

**Response handling:**
- max_tokens: 1200 (increased to accommodate detailed reasons for all models)
- Robust JSON array extraction handles Claude responses with extra text
- Only `aligned` and `alignment_reason` are copied onto each API result object (`alignment_score` is not returned)
- Fallback to keyword-based `evaluate_policy_alignment()` if Claude call fails

### Keyword-Based Alignment (Fallback)
Used only when AI-powered alignment fails. Original formula:
```
alignment_score = 1 - abs(model_confidence - policy_expected_threshold)
```

**Interpretation:**
- 1.0 = Perfect alignment (model confidence exactly matches policy threshold)
- 0.5 = Moderate disagreement
- 0.0 = Total misalignment

### Action Assignment
After determining model confidence, apply policy rules to enforce expected action:

1. **Zero-Tolerance Categories** (defined per platform) → Force "Remove" action if category matches
2. **Deprioritized Categories** (defined per platform) → Force "Allow" action if category matches
3. **Default:** Use model's action (Allow/Review/Remove) based on confidence + adjusted thresholds

### Platform Policies

#### Reddit
- **Zero-Tolerance:** violence, self-harm, sexual/minors, hate
- **Deprioritized:** (none)
- **Source:** redditinc.com/policies/content-policy

#### Discord
- **Zero-Tolerance:** sexual/minors, harassment/threatening
- **Deprioritized:** profanity, insult, toxicity
- **Source:** discord.com/guidelines (effective September 29, 2025)

#### Facebook
- **Zero-Tolerance:** hate, violence, sexual, self-harm, harassment
- **Deprioritized:** (none)
- **Source:** transparency.meta.com/policies/community-standards

#### Instagram
- **Zero-Tolerance:** hate, violence, sexual, self-harm, harassment
- **Deprioritized:** (none)
- **Source:** transparency.meta.com/policies/community-standards (unified November 2024)

#### Custom
User provides plain text. Keywords matched against predefined category keywords (see config.py `CUSTOM_POLICY_KEYWORDS`).

---

## Disagreement Detection

Disagreements are flagged when models conflict on safety decisions. Two types are detected:

| Type | Definition | Detection |
|---|---|---|
| **Action Mismatch** | Models recommend different actions | 2+ different action values across results |
| **Category Mismatch** | Models flag different top violation categories | 2+ different top_category values across results |

### Disagreement Banner
Displayed when any disagreement is detected. Shows icon, count, and brief explanation. Scoped to the Summary tab only — lives as the first child of `#lower-panel-summary`. Designed to draw attention to edge cases that warrant human review.

---

## Model Normalization Schema

All raw model outputs are normalized into a unified schema (normalizer.py):

```python
{
    "model": "string",                    # Model display name
    "raw_scores": {
        "category_1": 0.95,
        "category_2": 0.12,
        ...
    },                                    # Provider-specific scores
    "top_category": "toxicity",           # Highest-confidence category
    "confidence": 0.95,                   # 0.0-1.0 float
    "action": "Remove",                   # Allow | Review | Remove
    "flagged": true                       # action != Allow
}
```

### Category Aliases (normalizer.py)
Raw provider categories are mapped to a canonical namespace via `CATEGORY_ALIASES`:
- `toxicity`, `toxic` → `toxicity`
- `hate`, `hateful`, `hate_speech` → `hate`
- `offensive`, `offensive_language` → `harassment`
- `spam`, `phishing` → `spam`
- `bias`, `biased` → `bias`
- `threat` → `threat`
- `identity_attack`, `identity_hate` → `identity_attack`
- `sexual`, `sexually_explicit` → `sexual`
- `profanity`, `obscene` → `profanity`
- `insult`, `name-calling` → `insult`
- `self-harm` → `self-harm`
- `violence` → `violence`
- `label_0`, `nothate`, `normal`, `neutral`, `ham` → Treated as non-violations (filtered)

---

## Environment Variables

### Required (Production & Local)

**HF_API_KEY**
- HuggingFace User Access Token with read permissions
- Get at: huggingface.co/settings/tokens
- Covers all 5 HuggingFace models
- Set as secret in Doppler (project: modeval, config: prd) or in local `.env`

**HIVE_API_KEY**
- The Hive AI API key for V3 Text Moderation API
- Get at: app.thehive.ai (create account and generate token)
- Used by Hive Moderation enterprise model
- Set as secret in Doppler (project: modeval, config: prd) or in local `.env`

**AZURE_CS_KEY**
- Microsoft Azure Content Safety API key
- Get at: portal.azure.com (create Azure Content Safety resource)
- Used by Azure Content Safety enterprise model
- Set as secret in Doppler (project: modeval, config: prd) or in local `.env`

**AZURE_CS_ENDPOINT**
- Microsoft Azure Content Safety API endpoint URL
- Provided when you create the Azure resource
- Set as secret in Doppler (project: modeval, config: prd) or in local `.env`

**GOOGLE_NLP_KEY**
- Google Cloud Natural Language API key
- Get at: console.cloud.google.com (create service account and key)
- Used by Google NLP enterprise model
- Set as secret in Doppler (project: modeval, config: prd) or in local `.env`

**OPENAI_API_KEY**
- OpenAI API key for OpenAI Moderation API (model #8 in the pipeline)
- Get at: platform.openai.ai/api-keys
- Set as secret in Doppler (project: modeval, config: prd) or in local `.env`
- Falls back to empty string (model disabled) if not provided

**ANTHROPIC_API_KEY**
- Anthropic API key for Claude Haiku (claude-haiku-4-5-20251001)
- Used for AI-powered policy alignment assessment and AI summary generation
- Get at: console.anthropic.com
- Set as secret in Doppler (project: modeval, config: prd) or in local `.env`
- Required for both `evaluate_alignment_with_ai()` and `generate_ai_analysis()`

### Local Development Only
Create `.env` file in project root:
```
HF_API_KEY=hf_xxx...
OPENAI_API_KEY=sk-xxx...
```
Never commit `.env` to git (covered by `.gitignore`)

---

## Local Development Setup

### Prerequisites
- Python 3.12+
- pip
- Git

### Installation & Running

```bash
# Clone repository
git clone https://github.com/nipun-ag/ModEval.git
cd ModEval

# Create .env with your API keys
echo HF_API_KEY=your_hf_token > .env
echo OPENAI_API_KEY=your_openai_key >> .env

# Install dependencies
cd backend
pip install -r requirements.txt
cd ..

# Run Flask API (API-only — does not serve the UI)
py -m flask --app backend/app.py run

# In a separate terminal, run the React frontend
cd frontend
npm install
npm run dev
# Open http://127.0.0.1:5173 (or the port Vite prints). Dev requests use /api,
# which Vite proxies to https://modeval-api.bynipun.com by default.
```

### Testing an Endpoint
```bash
curl -X POST http://127.0.0.1:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I hate this",
    "platform": "Reddit"
  }'
```

---

## Deployment

### Architecture
The application uses a split architecture with frontend on Vercel and API on Hetzner:

**Frontend:**
- Platform: Vercel (vercel.com)
- URL: modeval.bynipun.com
- Files: React/Vite static bundle built from `frontend/`
- Production API calls go directly to `https://modeval-api.bynipun.com`
- Local `npm run dev` uses a Vite `/api` proxy to the production API by default

**API Backend:**
- Platform: Hetzner VPS (hetzner.com) — CX23 plan
- URL: modeval-api.bynipun.com
- Server: Hetzner CX23 (2 vCPU, 4 GB RAM, Nuremberg)
- Process Manager: systemd — auto-starts on boot, auto-restarts on crash
- Secret Management: Doppler (project: modeval, config: prd) injects secrets at runtime
- CORS: Enabled scoped to modeval.bynipun.com and localhost origins

### Request Flows

**Frontend (static assets):**
```
User → Cloudflare Edge → Vercel → React/Vite static bundle
```

**API (from frontend):**
```
React app → Cloudflare Edge → Nginx (modeval-api.bynipun.com:443) → Gunicorn (127.0.0.1:5000) → Flask
```

### Infrastructure (API Backend)
- **Reverse Proxy:** Nginx on port 80/443 → 127.0.0.1:5000 (Flask/Gunicorn)
- **SSL:** Let's Encrypt via Certbot with auto-renewal (origin cert); Cloudflare also terminates TLS at edge
- **Uptime:** App runs permanently — no cold starts, no spin-down behavior

### Auto-Deploy
- GitHub Actions workflow watches main branch
- On push: runs tests, builds, deploys via SSH (appleboy/ssh-action)
- Deployment script: pulls repo, installs dependencies, reloads systemd service
- Full setup: see INFRASTRUCTURE.md in repo root

### Monitoring
- `/health` endpoint available for uptime checks
- Systemd logs: `journalctl -u modeval -f`
- Nginx logs: `/var/log/nginx/{access,error}.log`

### Request Protection & Rate Limiting

**Cloudflare layer (modeval-api.bynipun.com):**
- Proxy status: orange cloud enabled — real server IP hidden from DNS
- SSL/TLS mode: Full (Strict) — validates origin Let's Encrypt cert
- Always Use HTTPS: enabled — HTTP redirected to HTTPS at edge

**Nginx rate limiting zones (/etc/nginx/nginx.conf):**
- Uses `$http_cf_connecting_ip` for real visitor IP (not Cloudflare's IP)
- analyze_limit: 10 requests/minute (for /analyze)
- general_limit: 60 requests/minute (for all other routes)

**Nginx site config (/etc/nginx/sites-available/modeval):**
- client_max_body_size: 16k — oversized requests return 413 before reaching Flask
- proxy_connect_timeout: 10s
- proxy_send_timeout: 30s
- proxy_read_timeout: 30s
- /analyze: analyze_limit zone, burst=3, returns 429 on violation
- /analyze: analyze_limit zone, burst=3, returns 429 on violation
- All other routes: general_limit zone, burst=20

---

## Known Limitations

### Model-Level
- **Frozen Models** — Scores reflect training data. Novel slang may score incorrectly.
- **English Only** — All moderation models are tuned for English-language text.
- **Text Only** — Images, video, audio, and other formats are out of scope.

### Platform-Level
- **Approximations** — Platform policies are interpretations, not official enforcement rules. Real enforcement involves human judgment, account history, and legal context.
- **Rate Limits** — HuggingFace free tier may rate-limit under sustained high traffic (>10 requests/second).
- **Inference Latency** — Models run sequentially or in parallel depending on infrastructure. Expect 2-8 seconds per request.

### System-Level
- **AI Summary Fallback** — If Claude Haiku AI analysis generation fails, `ai_analysis` returns an empty object. UI handles gracefully.
- **Alignment Fallback** — If Claude Haiku alignment call fails, falls back to keyword-based `evaluate_policy_alignment()`.
- **No Content Storage** — All submissions are ephemeral. No logging, no persistence by design.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Backend Framework | Flask | 3.1 | HTTP routing, request handling |
| WSGI Server | Gunicorn | (latest) | Production HTTP server |
| Python | Python | 3.12 | Core language |
| Model Inference | HuggingFace, Enterprise APIs | (live) | 3 Enterprise APIs + 4 HuggingFace + OpenAI |
| AI Summary & Alignment | Anthropic API | claude-haiku-4-5-20251001 | Natural language synthesis + policy alignment |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui | React 19 / Vite 8 | Single-page app on Vercel |
| Fonts | Google Fonts | (live) | DM Serif Display, Inter, JetBrains Mono |
| Version Control | Git | (local) | Repository management |
| Deployment | Vercel + Hetzner VPS | (live) | Frontend on Vercel, backend API on Hetzner via GitHub Actions |

---

## File-by-File Reference

### backend/app.py
- Creates Flask app instance
- Registers blueprints (`analyze_bp`, `models_bp`)
- API-only — does not serve frontend static files (UI is on Vercel)
- Provides `/health` endpoint
- Entry point for both development and production

### backend/config.py
- Loads environment variables from `.env`
- Defines all shared constants: thresholds, modifiers, policies
- No secrets hardcoded — all from environment
- Single source of truth for tuning parameters

### backend/routes/analyze.py
- `POST /analyze` endpoint handler
- Model orchestration via `ThreadPoolExecutor` (up to 8 parallel calls)
- Per-model error handling (failures don't crash whole response)
- Calls normalizer, policy engine, comparison engine, explainer
- Generates structured AI analysis via Claude Haiku (claude-haiku-4-5-20251001) via Anthropic SDK
- Returns unified response schema

### backend/routes/models.py
- `GET /models` endpoint handler
- Derives the model list from `backend/routes/analyze.py` so totals stay in sync
- Computes `active_count` by checking the required credential(s) for each configured runner
- `HF_API_KEY` counts as 4 (one per HuggingFace model sharing the key)
- Returns `{"active_count": N, "total_count": 8}`

### backend/engine/context_engine.py
- `calculate_context_adjustment()` — no parameters; returns fixed base thresholds (review=0.40, remove=0.70); platform-specific policy judgment delegated entirely to Claude Haiku alignment assessment
- `determine_action()` — maps confidence to Allow/Review/Remove
- No side effects, purely functional

### backend/engine/normalizer.py
- `normalize_scores()` — maps provider-specific categories to canonical names
- `normalize_result()` — converts raw model output to unified schema
- `build_error_result()` — creates safe placeholder for failed models
- Category alias mapping happens here
- Removed score_to_severity() function

### backend/engine/policy_engine.py
- `get_policy_rules()` — extracts zero-tolerance and deprioritized categories per platform
- `evaluate_alignment_with_ai()` — AI-powered batched Claude Haiku call assessing alignment for all active models simultaneously; receives original text for content-aware assessment; copies `aligned` and `alignment_reason` onto each result (any Claude `alignment_score` is internal only and not returned on API results); max_tokens=1200 with robust JSON extraction
- `evaluate_policy_alignment()` — keyword-based fallback alignment scoring if AI call fails; computes internal `alignment_score` / `aligned` / `policy_note`, but only `aligned` and `policy_note` (as `alignment_reason`) are written onto API results
- `get_platform_policy_summary()` — returns policy rules for 5 active platforms (Reddit, Discord, Facebook, Instagram, Custom)
- Applies custom policy keyword matching

### backend/engine/comparison.py
- `detect_disagreements()` — identifies action/category conflicts (severity_gap detection removed)
- `build_insights()` — finds strictest model, most lenient model, consensus recommendation
- Used to highlight edge cases

### backend/engine/explainer.py
- `explain_result()` — generates human-readable explanation text for each model result
- Contextualizes the action using fixed thresholds and policy notes
- Called for every result, not just failures

### backend/models/[model_name].py
- Each file wraps one model API (HuggingFace or OpenAI)
- Implements `analyze(text: str) -> dict` function
- Returns dict with `model` name and `scores` dict
- Handles API authentication, retries, timeout
- May raise exceptions (caught by route handler)

### frontend/src/App.tsx
- React application root
- Owns active panel, selected platform, input text, custom policy text, loading state, result state, active result tab, model count label, and health status
- Fetches `GET /models` and `GET /health` on load
- Sends `POST /analyze` through `frontend/src/lib/api.ts`
- Renders `TopBar`, `InputPanel`, `ResultsPanel`, `HowItWorksPanel`, and `ModelsPanel`

### frontend/src/lib/api.ts
- Central frontend API client
- Production API base: `https://modeval-api.bynipun.com`
- Local dev API base: `/api`, rewritten by the Vite dev proxy
- Exposes `fetchModels()`, `fetchHealth()`, and `analyzeText()`

### frontend/src/index.css
- Tailwind CSS v4 entrypoint and design tokens
- Holds layout, animation, and component-level styling used by the React frontend

### frontend/src/components/how-it-works/ (React)
- `PipelineFlowDiagram.tsx` — vertical SVG pipeline (viewBox 780×1380) with 8-lane horizontal fan-out; clickable `data-flow-node` stages
- `FlowDetailDrawer.tsx` — stage detail portal; side-by-side vs overlay via `FLOW_DRAWER_SIDE_BY_SIDE_MIN` (1280px)
- `HowItWorksPanel.tsx` — panel shell (max-width 1320) hosting diagram + drawer
- `flowContent.tsx` — node copy / model lane metadata for the drawer
- Ambient connector pulse: `.flow-connector` / `.flow-pulse` in `frontend/src/index.css`

---

## Data Flow

```
User Input
    ↓
POST /analyze (backend/routes/analyze.py)
    ↓
validate_payload()
    ├─→ check text length, required fields
    ↓
run_models() (parallel ThreadPoolExecutor)
    |- hive_moderation.analyze()
    |- azure_content_safety.analyze()
    |- google_nlp.analyze()
    |- openai_moderation.analyze()
    |- hf_toxic_bert.analyze()
    |- hf_roberta_offensive.analyze()
    |- hf_hate_speech.analyze()
    \- hf_bias.analyze()
    ↓
normalize_result() x 8
    ├─→ normalize_scores() (category aliasing)
    └─→ determine_action() (Allow/Review/Remove)
    ↓
evaluate_alignment_with_ai() — single batched Claude Haiku call
    ├─→ receives: original text + all active model results + platform policy
    ├─→ applies to results: aligned, alignment_reason (alignment_score not returned in API response)
    └─→ fallback: evaluate_policy_alignment() if Claude call fails
    ↓
explain_result() x active models
    └─→ human-readable explanation text
    ↓
detect_disagreements()
    └─→ action_mismatch, category_mismatch
    ↓
build_insights()
    ├─→ strictest_model
    ├─→ most_lenient_model
    └─→ consensus_recommendation
    ↓
generate_ai_analysis() — Claude Haiku (claude-haiku-4-5-20251001)
    └─→ disagreement_explanation, risk_narrative, context_sensitivity, contested_category
    ↓
JSON Response
    ↓
frontend/src/lib/api.ts
    ↓
frontend/src/App.tsx
    ├─→ update result state
    ├─→ render ResultsPanel
    ├─→ render Summary, Breakdown, and Insights tabs
    └─→ display to user
```

---

## Security Considerations

- **No Content Storage** — All submissions are processed and discarded immediately. No logging to disk.
- **API Keys in Environment** — Never hardcoded, never logged, loaded from environment/`.env` only.
- **No Session State** — Stateless architecture, each request is independent.
- **HTTPS Only** — Enforced by Nginx, certificate managed by Certbot/Let's Encrypt.
- **CORS** — Enabled for the split architecture. Production frontend runs on Vercel at `modeval.bynipun.com`, while the API runs on Hetzner at `modeval-api.bynipun.com`.
- **Input Validation** — Max length 500 characters, schema validation on all inputs.
- **Error Messages** — Never expose API keys or internal paths in error responses.
- **Cloudflare Proxy** — All traffic proxied through Cloudflare edge. Origin server IP not exposed in public DNS. SSL Full (Strict) mode enforced end-to-end.
- **Rate Limiting** — Nginx enforces per-IP rate limits using real visitor IP from Cloudflare header. /analyze: 10 req/min (burst 3). All other routes: 60 req/min (burst 20). Violations return 429.
- **Request Size** — client_max_body_size 16k at Nginx level. Oversized POST bodies return 413 before reaching Flask.
- **Security Headers** — Set on all responses via Nginx: X-Content-Type-Options (nosniff), X-Frame-Options (DENY), Referrer-Policy (strict-origin-when-cross-origin), X-XSS-Protection (1; mode=block).
- **Proxy Timeouts** — Nginx enforces connect (10s), send (30s), and read (30s) timeouts on all proxied requests.

---

## Future Extension Points

- **Additional Models** — Add new file in `backend/models/`, register in `MODEL_RUNNERS` dict
- **Custom Policies** — Extend `policy_engine.py` with rule engine beyond keyword matching
- **Webhooks** — Add `backend/routes/webhooks.py` for async processing
- **Analytics** — Add database layer (PostgreSQL) to track analyses without storing content
- **Export** — Add CSV/PDF download route

---

## React Frontend Components

### Navigation Structure
`TopBar.tsx` controls three panels through React state:
- `analysis`
- `how-it-works`
- `models`

`App.tsx` renders the active panel directly. There is no legacy `frontend/app.js` navigation layer.

### Analysis Panel
The analysis panel is a React grid with:
- `InputPanel.tsx` for text input, platform selection, custom policy text, example prompts, and submission
- `ResultsPanel.tsx` for empty, loading, error, and results states
- Summary, Breakdown, and Insights tabs rendered as React components

### How It Works Panel
The methodology view is React-based:
- `HowItWorksPanel.tsx` hosts the panel shell
- `PipelineFlowDiagram.tsx` renders the pipeline diagram
- `FlowDetailDrawer.tsx` renders stage detail
- `flowContent.tsx` stores node copy and model lane metadata

The diagram reflects the fixed-threshold model: review=0.40 and remove=0.70. Platform selection affects Claude Haiku policy alignment, not threshold modifiers.

### Models Panel
`ModelsPanel.tsx` renders model cards for the active model set:
- 3 enterprise APIs: Hive Moderation, Azure Content Safety, Google NLP
- 1 proprietary model: OpenAI Moderation
- 4 HuggingFace models: toxic-bert, RoBERTa offensive, Facebook hate speech, Valurank bias

### API Client Boundary
All frontend network calls go through `frontend/src/lib/api.ts`.
- Production: direct calls to `https://modeval-api.bynipun.com`
- Local dev: `/api` proxy configured in `frontend/vite.config.ts`




