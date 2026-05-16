# ModEval — AI Codebase Assistant Guide

## What This App Is
ModEval is a context and policy-aware AI moderation evaluation system. Runs text through 5 independent models (OpenAI Moderation, toxic-bert, RoBERTa offensive, Facebook hate speech, Valurank bias), normalizes outputs, applies platform context and strictness rules, scores policy alignment, and surfaces disagreements. Live at [modeval.bynipun.com](https://modeval.bynipun.com).

## Tech Stack
- **Backend:** Python 3.14, Flask 3.1, Gunicorn
- **Models:** OpenAI Moderation API + 4 HuggingFace models (Inference API)
- **AI Summary:** OpenAI GPT-4o-mini
- **Frontend:** Plain HTML, CSS, JavaScript (no frameworks)
- **Deployment:** Hetzner VPS (self-hosted) — see INFRASTRUCTURE.md

## Project Structure
```
backend/app.py                 Flask app, blueprints, static serving
backend/config.py              Config: API keys, thresholds, modifiers, policies
backend/routes/analyze.py      POST /analyze route, model orchestration
backend/routes/batch.py        POST /batch-analyze route
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
- **Threshold clamping** (0.10–0.90) in `context_engine.py` — critical safety bounds
- **Normalizer schema** fields — frontend depends on exact names
- **CSS variable names** in `style.css` — JS references some
- **Font imports** — DM Serif Display, Inter, JetBrains Mono (branding)
- **Donut chart SVG IDs** — donut-remove, donut-review, donut-allow, donut-fraction, donut-action-label
- **Gauge SVG IDs** — gauge-fill-path, gauge-number
- **Lower tabs IDs** — results-lower-tabs, lower-tab-summary, lower-tab-breakdown, lower-tab-insights
- **Lower panel IDs** — lower-panel-summary, lower-panel-breakdown, lower-panel-insights
- **Topbar nav IDs** — nav-analysis, nav-benchmark, nav-how-it-works, nav-models
- **Panel IDs** — benchmark-panel, how-it-works-panel, models-panel
All these are referenced in app.js and must not be renamed or removed.

## Where to Find Things
- **Technical architecture, APIs, models** → `docs/ARCHITECTURE.md`
- **Visual design system** → `DESIGN.md`
- **Public description** → `README.md`
- **Change log** → `PROGRESS.md`

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
- 9 models live and running in parallel:
  - 4 Enterprise APIs: Hive Moderation, Azure Content Safety, AWS Comprehend, Google NLP
  - 4 HuggingFace models: toxic-bert, RoBERTa offensive, hate-speech, bias-detector
  - 1 Proprietary: OpenAI Moderation
- Graceful degradation with disabled model handling:
  - Models without configured credentials show "Coming Soon" instead of errors in the decision matrix
  - Consensus, disagreements, and insights calculated only from active models
  - Dynamic model count in topbar reflects configured credentials
- Decision matrix rendered in two tiers:
  - Enterprise APIs tier with 5 vendor models
  - Open Source Models tier with 4 HuggingFace + OpenAI
  - Disabled models show gray rows at 0.4 opacity
- Context Engine with platform, content type, strictness modifiers
- Policy alignment scoring for Reddit, Discord, Facebook, Instagram
- Disagreement detection and banner
- AI Consensus Summary via GPT-4o-mini
- 100 pre-loaded test cases across 10 violation categories
- Phase 0 UX overhaul complete:
  - Topbar navigation with 4 tabs: ANALYSIS (active), BENCHMARK (locked), HOW IT WORKS, MODELS
  - HOW IT WORKS and MODELS are full-page panels accessed from topbar, not results tabs
  - Panel padding increased to 48px
  - Consensus hero card leads results with large action word, AI summary subtitle, donut chart, severity gauge, and action legend
  - Results panel has three lower tabs: Summary, Model Breakdown, Insights — hidden until analysis runs
  - Summary tab: consensus hero + donut + gauge + legend
  - Model Breakdown tab: decision matrix with tier rendering (no accordion)
  - Insights tab: strictest/most lenient cards + AI summary
  - Benchmark placeholder panel with coming soon state and 3 feature preview cards
  - Ambient glow blobs on results panel background
- Deployed on Hetzner VPS at modeval.bynipun.com — no cold starts

## Known Limitations
- HuggingFace free tier may rate-limit under high traffic
- English only — all models trained on English
- Platform policies are approximations, not real enforcement rules
- No content persistence — submissions are ephemeral by design
