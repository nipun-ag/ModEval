# ModEval — Complete Technical Architecture

**Last Updated:** May 2026  
**Status:** Live at [modeval.bynipun.com](https://modeval.bynipun.com)

---

## Project Folder Structure

```
modeval/
├── backend/
│   ├── app.py                          Flask entry point, blueprint registration, static file serving
│   ├── config.py                       Centralized config: API keys, thresholds, modifiers, policies
│   ├── requirements.txt                Python dependencies (Flask, Gunicorn, OpenAI SDK, dotenv)
│   ├── __pycache__/
│   ├── routes/
│   │   ├── analyze.py                  POST /analyze route, model orchestration, AI summary generation
│   │   ├── batch.py                    POST /batch-analyze route for multi-input bulk analysis
│   │   └── models.py                   GET /models route, credential-presence check returning active/total counts
│   ├── models/
│   │   ├── hf_toxic_bert.py            Unitary toxic-bert model wrapper
│   │   ├── hf_roberta_offensive.py     Cardiff NLP offensive language detector
│   │   ├── hf_hate_speech.py           Facebook FAIR hate speech detector
│   │   ├── hf_bias.py                  Valurank bias detector
│   │   └── openai_moderation.py        OpenAI Moderation API wrapper
│   └── engine/
│       ├── context_engine.py           Threshold calculation, platform/content/strictness modifiers
│       ├── normalizer.py               Raw model output → unified schema conversion
│       ├── policy_engine.py            Policy rule extraction and alignment scoring
│       ├── comparison.py               Disagreement detection and insight building
│       └── explainer.py                Per-model result interpretation and explanation text
├── frontend/
│   ├── index.html                      Single-page app shell, tabbed UI structure
│   ├── app.js                          All client-side logic: API calls, rendering, state management
│   └── style.css                       CSS variables, layout, animations, all responsive design
├── .env                                HF_API_KEY and OPENAI_API_KEY (local development only)
├── .gitignore                          Excludes .env, __pycache__, venv
├── README.md                           Public-facing project overview
├── DESIGN.md                           Design system: colors, typography, components, animations
├── CLAUDE.md                           Codebase documentation for AI assistance (< 150 lines)
├── PROGRESS.md                         Dated changelog of all features and fixes
└── docs/
    └── ARCHITECTURE.md                 This file — complete technical reference
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
  "content_type": "string (optional, defaults to 'Original Post')",
  "strictness": "string (optional, defaults to 'Balanced')",
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
      "raw_scores": {"category": score, ...},
      "top_category": "string — highest-confidence violation category",
      "confidence": "0.0-1.0 float, 4 decimal places",
      "action": "Allow | Review | Remove",
      "flagged": "boolean — true if action != Allow",
      "alignment_score": "0.0-1.0 float — AI-powered policy alignment",
      "aligned": "boolean — true if model verdict matches platform policy",
      "alignment_reason": "string — content-aware explanation from Claude Haiku",
      "explanation": "string — plain English explainer text",
      "error": "string (optional) — only on model failures"
    },
    ...up to 8 models total
  ],
  "disagreements": {
    "action_mismatch": ["list of model names"],
    "category_mismatch": ["list of model names"]
  },
  "insights": {
    "strictest_model": {"model": "string", "action": "string", "reason": "string"},
    "most_lenient_model": {"model": "string", "action": "string", "reason": "string"},
    "consensus_recommendation": "Allow | Review | Remove"
  },
  "ai_analysis": {
    "disagreement_explanation": "string — why models disagreed (empty if consensus)",
    "risk_narrative": "string — CLEAR VIOLATION/SAFE/AMBIGUOUS verdict with reasoning",
    "context_sensitivity": "string — whether human review is needed",
    "contested_category": "string — most disputed category across models"
  }
}
```

**Status Codes:**
- 200 OK — Analysis complete, all fields valid
- 400 Bad Request — Missing or invalid text input
- 500 Server Error — Model inference or AI analysis failure (results still returned)

---

### POST /batch-analyze
**Purpose:** Analyze multiple inputs with the same context settings (admin/testing endpoint).

**Request Body:**
```json
{
  "texts": ["string", "string", ...],
  "platform": "string (same options as /analyze)",
  "content_type": "string",
  "strictness": "string",
  "custom_policy_text": "string (optional, used only when platform='Custom')"
}
```

**Response Body:**
```json
{
  "total": "integer — count of inputs",
  "flagged_count": "integer — count of flagged inputs",
  "flag_rate": "float 0.0-1.0",
  "results": [
    {
      "text": "string — input text",
      "analysis": "{ full /analyze response }"
    },
    ...
  ]
}
```

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

Called on page load by `frontend/app.js` to update the `#models-active-count` topbar status pill dynamically.

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
MIN_THRESHOLD = 0.10              # Floor — never go below
MAX_THRESHOLD = 0.90              # Ceiling — never go above
```

### Threshold Calculation

All platforms use fixed base thresholds. No modifiers are applied.

```
review_threshold = BASE_REVIEW_THRESHOLD (0.40)
remove_threshold = BASE_REMOVE_THRESHOLD (0.70)
```

`calculate_context_adjustment()` always returns these fixed values regardless of platform, content_type, or strictness inputs.

---

## Policy Alignment Scoring

### AI-Powered Alignment (Primary)
`evaluate_alignment_with_ai()` in `policy_engine.py` makes a single batched Claude Haiku (claude-haiku-4-5-20251001) call to assess alignment for all active models simultaneously.

**Input to Claude:**
- Original text being analyzed (for content-aware assessment)
- All active model results (model name, action, confidence, top_category, alignment_score)
- Platform-specific policy instructions (zero-tolerance categories, deprioritized categories)

**Output from Claude (JSON array):**
```json
[
  {
    "model": "Hive Moderation",
    "aligned": true,
    "alignment_score": 0.92,
    "alignment_reason": "Hive correctly flagged harassment at 0.87 confidence, aligning with Discord's zero-tolerance for harassment/threatening."
  },
  ...
]
```

**Response handling:**
- max_tokens: 1200 (increased to accommodate detailed reasons for all models)
- Robust JSON array extraction handles Claude responses with extra text
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
- Python 3.14+
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

# Run Flask dev server
py -m flask --app backend/app.py run

# Open browser to http://127.0.0.1:5000
```

### Testing an Endpoint
```bash
curl -X POST http://127.0.0.1:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I hate this",
    "platform": "Reddit",
    "content_type": "Original Post",
    "strictness": "Balanced"
  }'
```

---

## Deployment

### Platform
Hetzner VPS (hetzner.com) — CX23 plan

### Infrastructure
- **Server:** Hetzner CX23 (2 vCPU, 4 GB RAM, Nuremberg)
- **Process Manager:** systemd — auto-starts on boot, auto-restarts on crash
- **Secret Management:** Doppler (project: modeval, config: prd) injects secrets at runtime
- **Reverse Proxy:** Nginx on port 80/443 → 127.0.0.1:5000 (Flask/Gunicorn)
- **SSL:** Let's Encrypt via Certbot with auto-renewal
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
| Python | Python | 3.14 | Core language |
| Model Inference | HuggingFace, Enterprise APIs | (live) | 3 Enterprise APIs + 4 HuggingFace + OpenAI |
| AI Summary & Alignment | Anthropic API | claude-haiku-4-5-20251001 | Natural language synthesis + policy alignment |
| Frontend | Vanilla HTML/CSS/JS | (native) | Single-page app, no frameworks |
| Fonts | Google Fonts | (live) | DM Serif Display, Inter, JetBrains Mono |
| Version Control | Git | (local) | Repository management |
| Deployment | Hetzner VPS | CX23 | Continuous deployment via GitHub Actions |

---

## File-by-File Reference

### backend/app.py
- Creates Flask app instance
- Registers blueprints (`analyze_bp`, `batch_bp`)
- Serves frontend static files from `frontend/` directory
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

### backend/routes/batch.py
- `POST /batch-analyze` endpoint handler
- Loops over multiple inputs, validates each item, then calls `/analyze` logic for each valid row
- Aggregates results and computes flag rate
- Used for testing and bulk analysis

### backend/routes/models.py
- `GET /models` endpoint handler
- Derives the model list from `backend/routes/analyze.py` so totals stay in sync
- Computes `active_count` by checking the required credential(s) for each configured runner
- `HF_API_KEY` counts as 4 (one per HuggingFace model sharing the key)
- Returns `{"active_count": N, "total_count": 8}`

### backend/engine/context_engine.py
- `calculate_context_adjustment()` — returns fixed base thresholds (review=0.40, remove=0.70) regardless of input; platform modifiers removed in favour of Claude Haiku policy judgment
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
- `evaluate_alignment_with_ai()` — AI-powered batched Claude Haiku call assessing alignment for all active models simultaneously; receives original text for content-aware assessment; returns aligned (bool), alignment_score (float), alignment_reason (string) per model; max_tokens=1200 with robust JSON extraction
- `evaluate_policy_alignment()` — keyword-based fallback alignment scoring if AI call fails
- `get_platform_policy_summary()` — returns policy rules for 5 active platforms (Reddit, Discord, Facebook, Instagram, Custom)
- Applies custom policy keyword matching
- Returns alignment_score and enforced_action

### backend/engine/comparison.py
- `detect_disagreements()` — identifies action/category conflicts (severity_gap detection removed)
- `build_insights()` — finds strictest model, most lenient model, consensus recommendation
- Used to highlight edge cases

### backend/engine/explainer.py
- `explain_result()` — generates human-readable explanation text for each model result
- Contextualizes the action in terms of platform, content type, and strictness
- Called for every result, not just failures

### backend/models/[model_name].py
- Each file wraps one model API (HuggingFace or OpenAI)
- Implements `analyze(text: str) -> dict` function
- Returns dict with `model` name and `scores` dict
- Handles API authentication, retries, timeout
- May raise exceptions (caught by route handler)

### frontend/index.html
- Single-page app shell
- Defines modal overlay for platform dropdown (5 options: Reddit, Discord, Facebook, Instagram, Custom)
- Platform policy guidelines box (#platform-policy-box) below platform selector
- Context explainer blurb above platform selector with link to How It Works (#explainer-howtoworks-link)
- Example pills for 100 pre-loaded test cases
- Tab navigation: Analysis, How It Works, Models
- Empty divs for JavaScript to populate

### frontend/app.js
- All client-side logic: state, rendering, API calls
- Handles form submissions, loading states, error display
- Renders breakdown cards (`renderBreakdownCard()`), disagreement banner, insight cards
- Manages modal open/close, tab switching
- Fetches test case library from embedded array
- On page load: fetches `GET /models` and updates `#models-active-count` pill text

### frontend/style.css
- CSS variables for colors, sizes, animations
- Layout: grid-based topbar + 38/62 split panels
- Responsive: single column below 900px
- Animation keyframes: pulse, shimmer, fade, modal-open/close
- Glassmorphism effects: blur, backdrop-filter

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
    ├─→ returns: aligned, alignment_score, alignment_reason per model
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
frontend/app.js
    ├─→ render decision matrix
    ├─→ render insight cards (bento grid)
    ├─→ render disagreement banner
    ├─→ render AI summary
    ├─→ render alignment assessment (Insights tab)
    └─→ display to user
```

---

## Security Considerations

- **No Content Storage** — All submissions are processed and discarded immediately. No logging to disk.
- **API Keys in Environment** — Never hardcoded, never logged, loaded from environment/`.env` only.
- **No Session State** — Stateless architecture, each request is independent.
- **HTTPS Only** — Enforced by Nginx, certificate managed by Certbot/Let's Encrypt.
- **CORS** — Not needed, frontend and backend same origin.
- **Input Validation** — Max length 500 characters, schema validation on all inputs.
- **Error Messages** — Never expose API keys or internal paths in error responses.

---

## Future Extension Points

- **Additional Models** — Add new file in `backend/models/`, register in `MODEL_RUNNERS` dict
- **Custom Policies** — Extend `policy_engine.py` with rule engine beyond keyword matching
- **Webhooks** — Add `backend/routes/webhooks.py` for async processing
- **Analytics** — Add database layer (PostgreSQL) to track analyses without storing content
- **Export** — Add CSV/PDF download route

---

## Phase 0 Frontend Components

### Navigation Structure
The topbar (.topbar-nav) has three items:
- ANALYSIS -- shows .workspace (38/62 split panels)
- HOW IT WORKS -- shows #how-it-works-panel
- MODELS -- shows #models-panel

Each click hides all other panels and shows the target.
Switching is handled by showPanel() and setActiveNav() 
in frontend/app.js.

### Full-Page Panels
All panels are direct children of .app-shell:
- .workspace -- the main analysis grid (default visible)
- #how-it-works-panel -- methodology content with 7 sections:
  - Section 1: Hero area ("STAGE 01") + Architecture Flow (icon circles with connectors showing Input → Normalize → Score → Align → Decide)
  - Section 2: Unified Output Normalization (two-col text + code-window with macOS chrome)
  - Section 3: Context Engine (simplified to platform modifier only; equation block showing threshold formula)
  - Section 4: AI-powered Policy Alignment Engine (explains Claude Haiku batched alignment call)
  - Section 5: Disagreement Detection
  - Section 6: AI Interpretation Layer
  - Section 7: Why These Models + Known Limitations
- #models-panel -- model cards content (5 enterprise + 4 HuggingFace + OpenAI)

### Results Panel Lower Tabs
After analysis runs, three lower tabs appear inside 
.results-content:

- results-lower-tabs: hidden until results load, 
  shown by JS after showPanelState("results")
- lower-panel-summary: disagreement banner (first child) + consensus hero + donut +
  legend (default active tab)
- lower-panel-breakdown: card-per-row breakdown layout, one card per model,
  section header rows with column labels (CATEGORY, CONFIDENCE, ACTION)
- lower-panel-insights (AI Interpretation tab): three-section asymmetric layout:
  - Top grid (2 columns): Disagreement Vector tall card (left) + right column with Most Lenient (top) and Strictest Model (bottom)
  - Alignment matrix: all 8 model alignment verdicts with ALIGNED/MISALIGNED badges and reasons; footer shows "Alignment assessed by Claude Haiku against [platform] content policy."
  - AI Executive Summary: gradient border card with consensus badge, finding tag (CLEAR VIOLATION/CLEAR SAFE/AMBIGUOUS), AI narrative, per-model confidence bars with MODEL CONFIDENCE header

Tab switching handled by click handlers on 
.lower-tab elements in frontend/app.js.

### Verdict Hero Card (.consensus-hero)
Populated by JS after results load:
- Eyebrow: "AGGREGATED CONSENSUS"
- Large action word: ALLOW/REVIEW/REMOVE in 
  DM Serif Display 64px, colored by action
- AI summary subtitle (first 2 sentences)
- Verdict visuals row (donut chart showing model votes)
- Border-left colored by action (green/amber/red)

### Verdict Visuals Row (.verdict-visuals-row)
Two-column grid inside .consensus-hero:
- Donut chart: SVG 120px showing model vote 
  distribution. IDs: donut-remove, donut-review, 
  donut-allow, donut-fraction, donut-action-label.
  Uses stroke-dasharray/dashoffset technique.

### Component IDs Referenced in app.js
These IDs must never be renamed:
- nav-analysis, nav-how-it-works, nav-models (topbar nav items)
- how-it-works-panel, models-panel (full-page panels)
- results-lower-tabs, lower-tab-summary, 
  lower-tab-breakdown, lower-tab-insights (lower tabs)
- lower-panel-summary, lower-panel-breakdown, 
  lower-panel-insights (lower panels)
- donut-remove, donut-review, donut-allow, 
  donut-fraction, donut-action-label (donut chart)
- hero-action, hero-subtitle (consensus hero)
- models-active-count (topbar status pill — updated dynamically by /models fetch)
- platform-policy-box (dynamic policy guidelines below platform selector)
- explainer-howtoworks-link (how it works link above platform selector)
- alignment-assessment-container (Insights tab alignment verdicts section)




