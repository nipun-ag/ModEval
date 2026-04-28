# ModEval — Complete Technical Architecture

**Last Updated:** April 2026  
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
│   │   └── batch.py                    POST /batch-analyze route for multi-input bulk analysis
│   ├── models/
│   │   ├── hf_toxic_bert.py            Unitary toxic-bert model wrapper
│   │   ├── hf_roberta_offensive.py     Cardiff NLP offensive language detector
│   │   ├── hf_hate_speech.py           Facebook FAIR hate speech detector
│   │   ├── hf_spam.py                  Manuel Romero SMS spam detector
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
**Purpose:** Analyze a single text input across all 5 moderation models.

**Request Body:**
```json
{
  "text": "string (1-500 characters, required)",
  "platform_context": "Social Media | Gaming | Professional | Forum | VR/Metaverse (default: Social Media)",
  "content_type": "Original Post | Comment/Reply | Username | Bio | UGC (default: Original Post)",
  "strictness": "Strict | Balanced | Lenient (default: Balanced)",
  "policy": "Reddit | Discord | Facebook | Instagram | Custom (default: Reddit)",
  "custom_policy_text": "string (optional, used only when policy='Custom')"
}
```

**Response Body:**
```json
{
  "results": [
    {
      "model": "string — model display name",
      "raw_scores": {"category": score, ...},
      "top_category": "string — highest-confidence violation category",
      "severity": "1-10 integer",
      "confidence": "0.0-1.0 float, 4 decimal places",
      "action": "Allow | Review | Remove",
      "flagged": "boolean — true if action != Allow",
      "alignment_score": "0.0-1.0 float — policy alignment",
      "aligned": "boolean — true if action matches policy expectation",
      "explanation": "string — plain English explainer text",
      "error": "string (optional) — only on model failures"
    },
    ...5 models total
  ],
  "disagreements": {
    "action_mismatch": ["list of model names"],
    "category_mismatch": ["list of model names"],
    "severity_gap": ["list of model names"]
  },
  "insights": {
    "strictest_model": {"model": "string", "action": "string", "reason": "string"},
    "most_lenient_model": {"model": "string", "action": "string", "reason": "string"},
    "consensus_recommendation": "Allow | Review | Remove"
  },
  "ai_summary": "string — GPT-4o-mini generated 2-3 sentence interpretation, or empty string on API failure"
}
```

**Status Codes:**
- 200 OK — Analysis complete, all fields valid
- 400 Bad Request — Missing or invalid text input
- 500 Server Error — Model inference or AI summary failure (results still returned)

---

### POST /batch-analyze
**Purpose:** Analyze multiple inputs with the same context settings (admin/testing endpoint).

**Request Body:**
```json
{
  "texts": ["string", "string", ...],
  "platform_context": "string",
  "content_type": "string",
  "strictness": "string",
  "policy": "string"
}
```

**Response Body:**
```json
{
  "total": "integer — count of inputs",
  "flagged": "integer — count of flagged results",
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

### GET /health
**Purpose:** Uptime monitoring endpoint for Render.

**Response:**
```json
{"status": "ok"}
```

---

## Model Details

All models run through the HuggingFace Inference API or OpenAI API (depending on the model). Each covers a distinct safety dimension.

### 1. OpenAI Moderation
- **API:** OpenAI Moderation API
- **Architecture:** Proprietary classification model (not disclosed)
- **Training Data:** Internal OpenAI dataset
- **Safety Dimensions:** Multiple (sexual, violence, self-harm, hate, harassment, harassment/threatening, illegal, etc.)
- **Output Schema:** Multi-label scores for 10+ violation types
- **Strengths:** Production-grade, high accuracy, covers edge cases OpenAI has seen
- **Limitations:** Proprietary, may not align with platform-specific policies

### 2. Toxicity Classifier (HuggingFace: unitary/toxic-bert)
- **Architecture:** BERT (12-layer, 768-hidden, 12-head)
- **Creator:** Unitary AI
- **Training Data:** Jigsaw Toxic Comments dataset (Wikipedia talk page comments)
- **Safety Dimension:** General toxicity baseline
- **Output Schema:** Multi-label scores for `toxic`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack`
- **Strengths:** Widely used in production, covers 6 toxicity dimensions, general-purpose
- **Limitations:** Trained on formal Wikipedia comments, may underperform on informal slang

### 3. Offensive Language Detector (HuggingFace: cardiffnlp/twitter-roberta-base-offensive)
- **Architecture:** RoBERTa-base (24-layer, 1024-hidden, 16-head)
- **Creator:** Cardiff NLP
- **Training Data:** Twitter / SemEval-2019 Task 6 (offensive language identification)
- **Safety Dimension:** Social media offensive language
- **Output Schema:** Multi-class scores for `NOT OFFENSIVE` (label 0), `OFFENSIVE` (label 1), `HATE` (label 2)
- **Strengths:** Twitter-specific training, excellent for slang and informal tone
- **Limitations:** May overfit to Twitter conventions, may miss platform-specific patterns from other networks

### 4. Hate Speech Detector (HuggingFace: facebook/roberta-hate-speech-dynabench-r4-target)
- **Architecture:** RoBERTa-base
- **Creator:** Facebook AI Research
- **Training Data:** DynaBench R4 — adversarially collected hate speech examples
- **Safety Dimension:** Identity-based hate speech
- **Output Schema:** Multi-class scores for `nothate` (label 0), `hate` (label 1), `offensive_language` (label 2)
- **Strengths:** Adversarial training makes it robust to evasion, focuses on hate not general offense
- **Limitations:** Binary hate/not-hate less granular, only 3-class output

### 5. Spam Detector (HuggingFace: mrm8488/bert-tiny-finetuned-sms-spam-detection)
- **Architecture:** BERT-tiny (2-layer, 128-hidden, 2-head) — only 4.4M parameters
- **Creator:** Manuel Romero
- **Training Data:** SMS Spam Collection dataset
- **Safety Dimension:** Spam and manipulative content
- **Output Schema:** Binary scores for `ham` (label 0), `spam` (label 1)
- **Strengths:** Extremely lightweight, 98% validation accuracy, fastest model
- **Limitations:** SMS-trained, may miss sophisticated social media spam patterns

### 6. Bias Detector (HuggingFace: valurank/distilroberta-bias)
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

### Threshold Calculation Formula

```
adjusted_review_threshold = clamp(BASE_REVIEW_THRESHOLD + platform_mod + content_mod + strictness_mod, 0.10, 0.90)
adjusted_remove_threshold = clamp(BASE_REMOVE_THRESHOLD + platform_mod + content_mod + strictness_mod, 0.10, 0.90)
```

If `review_threshold >= remove_threshold`, clamp review to `remove_threshold - 0.05` to preserve ordering.

All thresholds are rounded to 2 decimal places.

### Platform Modifiers
Reflects real platform risk tolerance and enforcement philosophy.

| Platform | Modifier | Rationale |
|---|---|---|
| Social Media | 0.00 | Baseline (Reddit, Discord, etc.) |
| Gaming | -0.10 | Higher tolerance for competitive language and banter |
| Professional | +0.15 | Lower tolerance, reputational and compliance risk |
| Forum / Community | -0.05 | Slightly higher tolerance for debate and discussion |
| VR / Metaverse | -0.15 | Evolving norms, experimental, higher tolerance |

### Content Type Modifiers
Reflects different moderation intensity by content placement.

| Content Type | Modifier | Rationale |
|---|---|---|
| Original Post | 0.00 | Baseline moderation |
| Comment / Reply | -0.05 | Slightly more lenient, inline context helps interpretation |
| Username | +0.20 | Very strict — username is permanent, visible, identity |
| Bio / Profile | +0.15 | Strict — persistent identity signal |
| UGC (User-Generated Content) | -0.05 | Slightly lenient — bulk volume requires balance |

### Strictness Modifiers
User-controlled policy strictness slider.

| Strictness | Modifier | Rationale |
|---|---|---|
| Strict | +0.15 | Raise thresholds, flag more content |
| Balanced | 0.00 | Baseline, no adjustment |
| Lenient | -0.15 | Lower thresholds, only extreme violations |

### Example Threshold Calculation

**Context:** Social Media, Comment/Reply, Strict

```
platform_mod: 0.00 (Social Media baseline)
content_mod: -0.05 (Comment/Reply = more lenient)
strictness_mod: +0.15 (Strict = stricter)
total_mod: 0.10

review_threshold = clamp(0.40 + 0.10) = 0.50
remove_threshold = clamp(0.70 + 0.10) = 0.80
```

---

## Policy Alignment Scoring

### Formula
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

Disagreements are flagged when models conflict on safety decisions. Three types are detected:

| Type | Definition | Detection |
|---|---|---|
| **Action Mismatch** | Models recommend different actions | 2+ different action values across results |
| **Category Mismatch** | Models flag different top violation categories | 2+ different top_category values across results |
| **Severity Gap** | Severity scores differ significantly | Max severity - Min severity >= 3 (on 1-10 scale) |

### Disagreement Banner
Displayed prominently when any disagreement is detected. Shows icon, count, and brief explanation. Designed to draw attention to edge cases that warrant human review.

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
    "severity": 9,                        # 1-10 integer
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

### Severity Mapping
Raw confidence (0.0-1.0) is scaled to 1-10 integer:
```python
severity = min(10, max(1, round(score * 10)))
```

---

## Environment Variables

### Required (Production & Local)

**HF_API_KEY**
- HuggingFace User Access Token with read permissions
- Get at: huggingface.co/settings/tokens
- Covers all 5 HuggingFace models
- Set as secret in Render dashboard or in local `.env`

**OPENAI_API_KEY**
- OpenAI API key for GPT-4o-mini (AI summary generation)
- Get at: platform.openai.ai/api-keys
- Set as secret in Render dashboard or in local `.env`
- Falls back to empty string (AI summary disabled) if not provided

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
    "platform_context": "Social Media",
    "content_type": "Original Post",
    "strictness": "Balanced",
    "policy": "Reddit"
  }'
```

---

## Deployment

### Platform
Render (render.com) — free tier

### Build Configuration
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `gunicorn --chdir backend app:app`
- **Node:** Auto-selected

### Environment Setup
1. Connect GitHub repository
2. Set secrets in Render dashboard:
   - `HF_API_KEY` — HuggingFace token
   - `OPENAI_API_KEY` — OpenAI key
3. Enable auto-deploy on push to `main`
4. Domain: modeval.bynipun.com (custom domain configured via CNAME)

### Cold Starts
Render free tier spins down after 15+ minutes of inactivity. First request after inactivity may take 30-60 seconds. This is expected behavior on free tier.

### Monitoring
- `/health` endpoint polled by Render for uptime
- Check deployment logs at render.com/dashboard

---

## Known Limitations

### Model-Level
- **Frozen Models** — Scores reflect training data. Novel slang may score incorrectly.
- **English Only** — All five models trained primarily on English data.
- **Text Only** — Images, video, audio, and other formats are out of scope.

### Platform-Level
- **Approximations** — Platform policies are interpretations, not official enforcement rules. Real enforcement involves human judgment, account history, and legal context.
- **Rate Limits** — HuggingFace free tier may rate-limit under sustained high traffic (>10 requests/second).
- **Inference Latency** — Models run sequentially or in parallel depending on infrastructure. Expect 2-8 seconds per request.

### System-Level
- **AI Summary Fallback** — If OpenAI API fails, `ai_summary` field returns empty string. UI handles gracefully.
- **No Content Storage** — All submissions are ephemeral. No logging, no persistence by design.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Backend Framework | Flask | 3.1 | HTTP routing, request handling |
| WSGI Server | Gunicorn | (latest) | Production HTTP server |
| Python | Python | 3.14 | Core language |
| Model Inference | HuggingFace Inference API | (live) | 5 HuggingFace models |
| AI Summary | OpenAI API | gpt-4o-mini | Natural language synthesis |
| Frontend | Vanilla HTML/CSS/JS | (native) | Single-page app, no frameworks |
| Fonts | Google Fonts | (live) | DM Serif Display, Inter, JetBrains Mono |
| Version Control | Git | (local) | Repository management |
| Deployment | Render | free tier | Continuous deployment |

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
- Model orchestration via `ThreadPoolExecutor` (5 parallel calls)
- Per-model error handling (failures don't crash whole response)
- Calls normalizer, policy engine, comparison engine, explainer
- Generates AI summary via OpenAI GPT-4o-mini
- Returns unified response schema

### backend/routes/batch.py
- `POST /batch-analyze` endpoint handler
- Loops over multiple inputs, calls `/analyze` logic for each
- Aggregates results and computes flag rate
- Used for testing and bulk analysis

### backend/engine/context_engine.py
- `calculate_context_adjustment()` — computes final thresholds
- `determine_action()` — maps confidence to Allow/Review/Remove
- `clamp()` — enforces 0.10-0.90 threshold bounds
- No side effects, purely functional

### backend/engine/normalizer.py
- `normalize_scores()` — maps provider-specific categories to canonical names
- `normalize_result()` — converts raw model output to unified schema
- `score_to_severity()` — scales 0-1 confidence to 1-10 severity
- `build_error_result()` — creates safe placeholder for failed models
- Category alias mapping happens here

### backend/engine/policy_engine.py
- `get_policy_rules()` — extracts zero-tolerance and deprioritized categories
- `evaluate_policy_alignment()` — scores alignment, enforces policy rules
- Applies custom policy keyword matching
- Returns alignment_score and enforced_action

### backend/engine/comparison.py
- `detect_disagreements()` — identifies action/category/severity conflicts
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
- Defines modal overlays for platform, content type, strictness dropdowns
- Example pills for 100 pre-loaded test cases
- Tab navigation: Analysis, How It Works, Models, (Did You Know deferred)
- Empty divs for JavaScript to populate

### frontend/app.js
- All client-side logic: state, rendering, API calls
- Handles form submissions, loading states, error display
- Renders decision matrix table, disagreement banner, insight cards
- Manages modal open/close, tab switching
- Fetches test case library from embedded array

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
    ├─→ openai_moderation.analyze()
    ├─→ hf_toxic_bert.analyze()
    ├─→ hf_roberta_offensive.analyze()
    ├─→ hf_hate_speech.analyze()
    └─→ hf_bias.analyze()
    ↓
normalize_result() × 5
    ├─→ normalize_scores() (category aliasing)
    ├─→ score_to_severity() (1-10 scaling)
    └─→ determine_action() (Allow/Review/Remove)
    ↓
evaluate_policy_alignment() × 5
    ├─→ get_policy_rules()
    └─→ alignment_score, enforced_action
    ↓
explain_result() × 5
    └─→ human-readable explanation text
    ↓
detect_disagreements()
    └─→ action_mismatch, category_mismatch, severity_gap
    ↓
build_insights()
    ├─→ strictest_model
    ├─→ most_lenient_model
    └─→ consensus_recommendation
    ↓
generate_ai_summary()
    └─→ OpenAI GPT-4o-mini (async)
    ↓
JSON Response
    ↓
frontend/app.js
    ├─→ render decision matrix
    ├─→ render insight cards
    ├─→ render disagreement banner
    ├─→ render AI summary
    └─→ display to user
```

---

## Security Considerations

- **No Content Storage** — All submissions are processed and discarded immediately. No logging to disk.
- **API Keys in Environment** — Never hardcoded, never logged, loaded from environment/`.env` only.
- **No Session State** — Stateless architecture, each request is independent.
- **HTTPS Only** — Enforced by Render HTTPS redirect.
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
- **Multilingual** — Swap models for multilingual variants (xlm-roberta, etc.)
