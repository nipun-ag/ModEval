# ModEval — AI Codebase Assistant Guide

## What This App Is
ModEval is a context and policy-aware AI moderation evaluation system. Runs text through 8 independent models (Hive Moderation, Azure Content Safety, Google NLP, OpenAI Moderation, toxic-bert, RoBERTa offensive, Facebook hate speech, Valurank bias), normalizes outputs, applies platform context and strictness rules, scores policy alignment, and surfaces disagreements. Live at [modeval.bynipun.com](https://modeval.bynipun.com).

## Tech Stack
- **Backend:** Python 3.12, Flask 3.1, Gunicorn
- **Models:** OpenAI Moderation API + 4 HuggingFace models (Inference API)
- **AI Summary:** Claude Haiku (Anthropic)
- **Frontend:** Plain HTML, CSS, JavaScript (no frameworks)
- **Deployment:** Hetzner VPS (self-hosted) — see INFRASTRUCTURE.md

## Project Structure
```
backend/app.py                 Flask app, blueprints, static serving
backend/config.py              Config: API keys, thresholds, modifiers, policies
backend/routes/analyze.py      POST /analyze route, model orchestration
backend/routes/batch.py        POST /batch-analyze route
backend/routes/models.py       GET /models route, credential-presence check
backend/engine/context_engine.py    Threshold calculation (platform/content/strictness)
backend/engine/normalizer.py   Raw output → unified schema conversion
backend/engine/policy_engine.py     Policy rules and alignment scoring
backend/engine/comparison.py    Disagreement detection, insights
backend/engine/explainer.py     Per-model result explanation text
backend/models/[model].py       Individual model API wrappers
frontend/index.html            Single-page app shell, modals, tabs
frontend/app.js                All client-side logic, rendering, API calls
frontend/style.css             CSS variables, layout, animations
docs/ARCHITECTURE.md           Complete technical reference (this file)
```

## Coding Conventions
- Python: PEP8, snake_case, type hints where practical
- Flask routes: one file per route group in `routes/`
- Engine modules: one file per concern in `engine/`
- Frontend: vanilla JS, no frameworks, HTML/CSS/JS separation
- Error handling: always on API calls and model inference
- **Privacy:** Never log or store submitted content
- **API Keys:** Environment variables only, never hardcoded
- Model calls: Through respective API wrappers only (config.py defines API keys)

## What NOT to Touch
- **Model IDs** in `config.py` — exact HuggingFace/OpenAI model identifiers
- **Fixed thresholds** (review=0.40, remove=0.70) in `context_engine.py` — do not add modifier logic here; platform policy judgment belongs in `policy_engine.py`
- **Normalizer schema** fields — frontend depends on exact names
- **CSS variable names** in `style.css` — JS references some
- **Font imports** — DM Serif Display, Inter, JetBrains Mono (branding)
- **Donut chart SVG IDs** — donut-remove, donut-review, donut-allow, donut-fraction, donut-action-label
- **Lower tabs IDs** — results-lower-tabs, lower-tab-summary, lower-tab-breakdown, lower-tab-insights
- **Lower panel IDs** — lower-panel-summary, lower-panel-breakdown, lower-panel-insights
- **Topbar nav IDs** — nav-analysis, nav-how-it-works, nav-models
- **Panel IDs** — how-it-works-panel, models-panel
- **Topbar status pill ID** — models-active-count (updated dynamically by /models fetch on page load)
- **Platform policy box ID** — platform-policy-box (dynamic policy guidelines below platform selector)
- **Alignment assessment container ID** — alignment-assessment-container (Insights tab alignment verdicts section)
All these are referenced in app.js and must not be renamed or removed.

## Where to Find Things
- **Technical architecture, APIs, models** → `docs/ARCHITECTURE.md`
- **Visual design system** → `docs/DESIGN.md`
- **Public description** → `README.md`
- **Change log** → `docs/PROGRESS.md`
- **deployment details** → `docs/INFRASTRUCTURE.md`


## Self-Updating Meta Instruction

Trigger this automatically when:
- A feature is fully working and tested
- A bug is fixed and confirmed
- You are about to switch to a different task
- The user says "done", "ship it", "looks good", "push it", "that works", or any similar phrase
Do not wait for explicit wrap-up instructions.

### After Every Session -- Required Steps

**Step 1 -- Update AGENTS.md AND CLAUDE.md (always both)**
- Update "Current Project State" bullet points
- These two files must always be identical
- Never update one without the other

**Step 2 -- Add entry to PROGRESS.md**
- Add new dated entry at the TOP of the file
- Format: ## YYYY-MM-DD
- Include: what changed, why, any tradeoffs made

**Step 3 -- Update DESIGN.md if ANY of these changed:**
- New UI components added or removed
- Existing component behavior changed
- CSS classes added or removed
- Layout structure changed
- Navigation structure changed
- Animation or interaction behavior changed

**Step 4 -- Update docs/ARCHITECTURE.md if ANY of these changed:**
- Backend routes or API endpoints
- Engine modules or scoring logic
- Frontend HTML structure (panels, tabs, IDs)
- New component IDs referenced in app.js
- Data flow changes
- Note: frontend structural changes DO count here

**Step 5 -- Commit and push**
Run: git add . && git commit -m "[type]: description" && git push origin main

### What Each File Covers
- AGENTS.md / CLAUDE.md -- current state, conventions, what not to touch, task patterns
- PROGRESS.md -- dated changelog of all changes
- DESIGN.md -- visual design, components, typography, spacing, animations
- docs/ARCHITECTURE.md -- API endpoints, data flow, engine logic, frontend structure, component IDs
- README.md -- NEVER update with session notes, public-facing only

### Verification Checklist Before Committing
- [ ] AGENTS.md and CLAUDE.md are identical
- [ ] PROGRESS.md has a new dated entry at the top
- [ ] DESIGN.md updated if any UI/CSS changes made
- [ ] ARCHITECTURE.md updated if any structural changes
- [ ] All new HTML IDs added to "What NOT to Touch" in both AGENTS.md and CLAUDE.md
- [ ] git status shows no untracked important files

## Commit Format
`type: description`
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `style:` CSS or UI
- `refactor:` restructuring, no behavior change

## Before Any Task
1. Read relevant docs first — never assume state
2. Models/thresholds task → read `docs/ARCHITECTURE.md` first
3. UI task → read `DESIGN.md` first
4. Flask routes → read `backend/routes/` first
5. Scoring logic → read `backend/engine/` first

## Never Without Asking First
- Change model IDs in `config.py`
- Modify normalizer output schema
- Change threshold clamping range
- Modify GitHub Actions workflow or systemd service config
- Add Python dependencies without updating `requirements.txt`

## Common Task Patterns

### Add a new Flask route
1. Create file in `backend/routes/`
2. Register blueprint in `backend/app.py`
3. Update `docs/ARCHITECTURE.md` with endpoint spec
4. Test: `py -m flask --app backend/app.py run`

### Add a new model
1. Create wrapper in `backend/models/`
2. Add model ID to `config.py`
3. Update normalizer if schema differs
4. Add model card to frontend Models tab
5. Update `docs/ARCHITECTURE.md`

### Change threshold logic
1. Read `context_engine.py` fully first
2. Check `docs/ARCHITECTURE.md` for current modifier tables
3. Update modifier tables after changes

## Current Project State
- 8 models live and running in parallel:
  - 3 Enterprise APIs: Hive Moderation, Azure Content Safety, Google NLP
  - 4 HuggingFace models: toxic-bert, RoBERTa offensive, hate-speech, bias-detector
  - 1 Proprietary: OpenAI Moderation
- Graceful degradation with disabled model handling:
  - Models without configured credentials show "Coming Soon" instead of errors in the decision matrix
  - Consensus, disagreements, and insights calculated only from active models
  - Dynamic model count in topbar reflects configured credentials
- Decision matrix rendered in two tiers:
  - Enterprise APIs tier with 3 vendor models
  - Open Source Models tier with 4 HuggingFace + OpenAI
  - Disabled models show gray rows at 0.4 opacity
- Platform options reduced to 5: Reddit, Discord, Facebook, Instagram, Custom (Gaming Platform, Professional, Community/Forum, VR/Metaverse removed)
- PLATFORM_MAP in config.py updated to match 5 active platforms
- Content Type and Strictness dropdowns removed from UI entirely; backend defaults to "Original Post" and "Balanced" if not provided
- AI-powered policy alignment using Claude Haiku (claude-haiku-4-5-20251001): single batched call evaluates all model results against platform policy with original content context, returns alignment_score, aligned (bool), and alignment_reason for each model; flags model failures and acknowledges ambiguous content
- Alignment reasons reference actual content being analyzed, not just category labels
- Claude prompts clarified: models return confidence scores only; ModEval's threshold system (score <0.40=Allow, 0.40-0.70=Review, >0.70=Remove) assigns actions. AI evaluation assesses confidence appropriateness, not model "decisions."
- Fallback to keyword-based alignment logic if Claude call fails, ensuring analysis always completes
- Both interpretation calls (alignment + AI summary) use Anthropic SDK — anthropic package added to requirements.txt
- **Requires ANTHROPIC_API_KEY in Doppler (project: modeval, config: prd) for production** — already configured
- Dynamic platform policy guidelines box below platform selector showing accurate sourced rules for each platform (Reddit, Discord, Facebook, Instagram based on official documentation) — collapsible by default, expands on header click with smooth max-height transition and rotating chevron icon
- AI Interpretation disclaimer banner at top of Insights tab (now renamed to AI INTERPRETATION) explaining Claude Haiku's output is probabilistic and intended to assist, not replace, human review — dynamically injected in renderInsights() to survive innerHTML overwrites, SVG info icon, 12px bright text with subtle left border accent for legibility
- Context explainer tooltip above Platform selector explaining why platform selection exists (hover info icon to reveal)
- Platform selector simplified to 5 options with modal dropdown showing platform name + description
- AI analysis with 4 structured analytical fields: disagreement_explanation (what does disagreement reveal?), risk_narrative (direct CLEAR/SAFE/GREY verdict with reasoning), context_sensitivity (human review needed?), contested_category (most disagreed category)
- Senior T&S analyst persona in AI summary generation using Claude Haiku: flags model failures, explains ambiguity, recommends human review, avoids passive summarization
- Disagreement detection and banner (scoped to Summary tab only — first child of #lower-panel-summary)
- Dynamic topbar model count: GET /models endpoint returns active/total from credential-presence check; JS updates #models-active-count pill on page load and does not overwrite it during analysis
- Batch analysis validates each row independently and excludes error rows from flagged-rate calculations
- 100 pre-loaded test cases across 10 violation categories
- Phase 0 UX overhaul complete:
  - Topbar navigation with 3 tabs: ANALYSIS (active), HOW IT WORKS, MODELS
  - HOW IT WORKS and MODELS are full-page panels accessed from topbar, not results tabs
  - Panel padding increased to 48px
  - Consensus hero card leads results with large action word, AI analysis subtitle, donut chart, and action legend
  - Results panel has three lower tabs: Summary, Model Breakdown, AI Interpretation — hidden until analysis runs
  - Summary tab: disagreement banner + consensus hero + donut + legend
  - Model Breakdown tab: card-per-row layout with section header rows (CATEGORY, CONFIDENCE, ACTION); one card per model; no alignment column
  - AI Interpretation tab: three-section layout:
    - Top grid (3 cards): Disagreement Vector left tall card + Most Lenient Model (top right) + Strictest Model (bottom right); Risk Narrative card removed
    - Alignment matrix: All model alignment verdicts with ALIGNED/MISALIGNED badges and reasons, footer "Alignment assessed by Claude Haiku against [platform] content policy."
    - Elevated AI executive summary card: Gradient teal/purple border with glow, consensus badge, auto-classified finding tag (CLEAR VIOLATION/SAFE CONTENT/AMBIGUOUS), AI narrative, MODEL CONFIDENCE header above per-model confidence bars with gradient fill
  - How It Works panel with 7 sections: Normalization, Context Engine (simplified to platform modifier only), AI-powered Policy Alignment Engine, Disagreement Detection, AI Interpretation Layer, Why These Models, Known Limitations
  - Ambient glow blobs on results panel background
- Deployed on Hetzner VPS at modeval.bynipun.com — Flask serves both API and frontend static files via a single Gunicorn process; Cloudflare proxies all traffic in front of Nginx; no cold starts
- Fixed threshold model: All platforms use identical base thresholds (review=0.40, remove=0.70) — platform-specific policy judgment delegated entirely to Claude Haiku alignment assessment
- Platform threshold modifiers completely removed — prior approach (Discord +0.05, Facebook -0.05, Instagram -0.10, etc.) was discarded as it distorted raw model signal before Claude evaluation
- Content Type and Strictness modifiers removed — these inputs accepted but not used (v1 convenience, non-essential)
- Severity field completely removed from entire codebase — was a 1-10 scaling of confidence that added little value; decision-making now based purely on action (Allow/Review/Remove) and policy alignment
  - Removed score_to_severity() function and all severity calculations from normalizer.py
  - Removed severity_gap detection from comparison.py
  - Removed gauge visualization from verdict-visuals-card in index.html, skeleton state now shows single circle
  - Removed all gauge-related CSS classes and severity bar column from breakdown cards
  - Backend API responses no longer contain severity field
  - Focused on action-based consensus (donut chart) instead of severity-based visualization
- Mobile overflow fix in `style.css` (`@media max-width: 900px` + `600px`): `min-width: 0` on flex/grid children, mobile-only universal shrink, `100%` containment (no `100vw`), stacked breakdown fields, fixed `.insights-alignment-reason` mobile selector, `overflow-wrap: anywhere` for long URLs/strings/AI text, methodology table scroll + `table-layout: fixed`, arch-flow wrapping — QA passed at 375/393/360px widths
- Flask backend security hardening complete:
  - Timeout enforcement at multiple layers: Cloudflare (via HTTP timeout) → Nginx proxy (30s connect/send/read) → ThreadPoolExecutor (25s on model execution) → Anthropic SDK (25s on API calls) — creates defense-in-depth with no single point of failure
  - Error sanitization: Full exception details logged server-side via structured logging; clients receive only generic "Service temporarily unavailable" messages in error states (400, 404, 429, 500)
  - ANTHROPIC_API_KEY centralized in config.py and loaded once at startup instead of repeated os.getenv() calls in request handlers
  - Global error handlers for 400, 404, 429, 500 return JSON with generic error messages (no stack traces or implementation details exposed)
  - All print() calls replaced with logging module (warning/info/error levels) — better auditability and structured output
  - TimeoutError handling in ThreadPoolExecutor.as_completed() returns partial results with sanitized errors instead of crashing

## Known Limitations
- HuggingFace free tier may rate-limit under high traffic
- English only — all models trained on English
- Platform policies are approximations, not real enforcement rules
- No content persistence — submissions are ephemeral by design

