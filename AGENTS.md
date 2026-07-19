# ModEval — AI Codebase Assistant Guide

## What This App Is
ModEval is a context and policy-aware AI moderation evaluation system. Runs text through 8 independent models (Hive Moderation, Azure Content Safety, Google NLP, OpenAI Moderation, toxic-bert, RoBERTa offensive, Facebook hate speech, Valurank bias), normalizes outputs, applies platform context and strictness rules, scores policy alignment, and surfaces disagreements. Live at [modeval.bynipun.com](https://modeval.bynipun.com).

## Tech Stack
- **Backend:** Python 3.12, Flask 3.1, Gunicorn (API-only)
- **Models:** OpenAI Moderation API + 4 HuggingFace models (Inference API) + Hive, Azure, Google NLP
- **AI Summary:** Claude Haiku (Anthropic)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui (Alloy Night)
- **Deployment:** Frontend on Vercel (modeval.bynipun.com); API on Hetzner (modeval-api.bynipun.com) — see INFRASTRUCTURE.md

## Project Structure
```
backend/app.py                 Flask app, blueprints (API-only; no static UI serving)
backend/config.py              Config: API keys, thresholds, policies
backend/routes/analyze.py      POST /analyze route, model orchestration
backend/routes/models.py       GET /models route, credential-presence check
backend/engine/context_engine.py    Fixed threshold calculation (review=0.40, remove=0.70)
backend/engine/normalizer.py   Raw output → unified schema conversion
backend/engine/policy_engine.py     Policy rules and alignment scoring
backend/engine/comparison.py    Disagreement detection, insights
backend/engine/explainer.py     Per-model result explanation text
backend/models/[model].py       Individual model API wrappers
frontend/                      React/Vite/TypeScript app (Vercel)
docs/ARCHITECTURE.md           Complete technical reference
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
- React/Vite/TypeScript frontend (Alloy Night theme) live on Vercel; Flask API on Hetzner is API-only (no static UI serving)
- Production frontend calls `https://modeval-api.bynipun.com` directly; local `npm run dev` uses Vite `/api` proxy
- POST `/batch-analyze` removed (unused by React frontend); `MAX_BATCH_SIZE` and `backend/routes/batch.py` deleted
- `content_type` / `strictness` request fields removed end-to-end (were no-ops); `/analyze` accepts `text`, `platform`, optional `custom_policy_text` only
- Dead-path cleanup in `policy_engine.py`: unused `PLATFORM_MAP` import, unreachable `"generic"` branch, unused `enforced_action` locals
- Response fields intentionally kept for other consumers: `flagged`, `insights.*.action`, `total_count` (even if UI does not render all of them)
- 8 models live and running in parallel:
  - 3 Enterprise APIs: Hive Moderation, Azure Content Safety, Google NLP
  - 4 HuggingFace models: toxic-bert, RoBERTa offensive, hate-speech, bias-detector
  - 1 Proprietary: OpenAI Moderation
- Graceful degradation with disabled model handling:
  - Models without configured credentials show "Coming Soon" instead of errors in the decision matrix
  - Consensus, disagreements, and insights calculated only from active models
  - Dynamic model count in topbar reflects configured credentials
- Platform options: Reddit, Discord, Facebook, Instagram, Custom
- PLATFORM_MAP in config.py updated to match 5 active platforms
- AI-powered policy alignment using Claude Haiku (claude-haiku-4-5-20251001): single batched call evaluates all model results against platform policy with original content context; copies `aligned` and `alignment_reason` onto each result (alignment_score is computed internally but not returned on result objects)
- Alignment reasons reference actual content being analyzed, not just category labels
- Claude prompts clarified: models return confidence scores only; ModEval's threshold system (score <0.40=Allow, 0.40-0.70=Review, >0.70=Remove) assigns actions
- Fallback to keyword-based alignment logic if Claude call fails, ensuring analysis always completes
- Both interpretation calls (alignment + AI summary) use Anthropic SDK — anthropic package added to requirements.txt
- **Requires ANTHROPIC_API_KEY in Doppler (project: modeval, config: prd) for production** — already configured
- Dynamic platform policy guidelines box below platform selector
- AI analysis with 4 structured analytical fields: disagreement_explanation, risk_narrative, context_sensitivity, contested_category
- Finding tag (CLEAR VIOLATION / CLEAR SAFE / AMBIGUOUS) derived from `insights.consensus_recommendation`, not free-text risk_narrative
- Disagreement detection and banner (action/category mismatch when 2+ distinct values among non-error results)
- Dynamic topbar model count: GET /models returns active/total from credential-presence check
- 100 pre-loaded test cases across 10 violation categories
- Deployed as split architecture: Vercel serves frontend at modeval.bynipun.com, Hetzner VPS serves API at modeval-api.bynipun.com; Cloudflare proxies both; flask-cors scoped to modeval.bynipun.com
- Fixed threshold model: All platforms use identical base thresholds (review=0.40, remove=0.70)
- Flask backend security hardening: multi-layer timeouts, sanitized client errors, logging module, global JSON error handlers

## Known Limitations
- HuggingFace free tier may rate-limit under high traffic
- English only — all models trained on English
- Platform policies are approximations, not real enforcement rules
- No content persistence — submissions are ephemeral by design

