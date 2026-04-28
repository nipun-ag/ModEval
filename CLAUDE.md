# ModEval — AI Codebase Assistant Guide

## What This App Is
ModEval is a context and policy-aware AI moderation evaluation system. Runs text through 5 independent models (OpenAI Moderation, toxic-bert, RoBERTa offensive, Facebook hate speech, Valurank bias), normalizes outputs, applies platform context and strictness rules, scores policy alignment, and surfaces disagreements. Live at [modeval.bynipun.com](https://modeval.bynipun.com).

## Tech Stack
- **Backend:** Python 3.14, Flask 3.1, Gunicorn
- **Models:** OpenAI Moderation API + 4 HuggingFace models (Inference API)
- **AI Summary:** OpenAI GPT-4o-mini
- **Frontend:** Plain HTML, CSS, JavaScript (no frameworks)
- **Deployment:** Render (free tier, auto-deploy on push to main)

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

## Where to Find Things
- **Technical architecture, APIs, models** → `docs/ARCHITECTURE.md`
- **Visual design system** → `DESIGN.md`
- **Public description** → `README.md`
- **Change log** → `PROGRESS.md`

## Self-Updating Meta Instruction
Update docs after every completed task:
1. `CLAUDE.md` — current state (if changed)
2. `PROGRESS.md` — dated entry (what changed and why)
3. `DESIGN.md` — if UI changed
4. `docs/ARCHITECTURE.md` — if backend/API changed
5. Commit: `git add . && git commit -m "[type]: description" && git push`

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
- Modify Render deployment config
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
- 5 models live and running (OpenAI + 4 HuggingFace)
- Context Engine with platform, content type, strictness modifiers
- Policy alignment scoring for Reddit, Discord, Facebook, Instagram
- Disagreement detection and banner
- AI Consensus Summary via GPT-4o-mini
- 100 pre-loaded test cases across 10 violation categories
- 4 tabs: Analysis, How It Works, Models
- Deployed on Render at modeval.bynipun.com

## Known Limitations
- HuggingFace free tier may rate-limit under high traffic
- English only — all models trained on English
- Platform policies are approximations, not real enforcement rules
- Render free tier spins down after inactivity (cold start delay)
- No content persistence — submissions are ephemeral by design
