# ModEval — Change Log

All dated entries document features, fixes, and documentation updates. Format: `[Date] Type: Description`

---

## 2026-05-15

**infra: migrate backend from Render to Hetzner VPS**

Changes:
- Moved Flask/Gunicorn backend from Render free tier to self-hosted Hetzner CX23 (2 vCPU, 4 GB RAM, Nuremberg)
- App now managed by systemd — auto-starts on boot, auto-restarts on crash
- Secrets injected via Doppler service token at runtime
- Nginx configured as reverse proxy for modeval.bynipun.com
- SSL via Let's Encrypt/Certbot with auto-renewal
- Auto-deploy on push to main via GitHub Actions (appleboy/ssh-action)
- No more cold starts — app runs permanently
- Added INFRASTRUCTURE.md documenting hosting details, deploy flow, and troubleshooting

**docs: update ARCHITECTURE.md deployment references to reflect Hetzner migration**

Changes:
- Removed all Render-specific deployment instructions
- Updated environment variable instructions to reference Doppler
- Updated deployment section to document Hetzner/systemd/Nginx/Certbot stack
- Updated security section HTTPS note
- Updated tech stack table

---

## 2026-05-09

**style: rename disabled decision matrix label to coming soon**

Changes shipped:
- Replaced the disabled decision matrix label text from "Not Configured" to "Coming Soon" in the frontend rendering logic
- Updated the matching frontend CSS comment so the frontend directory contains zero `Not Configured` string matches
- Left backend behavior, styling, and disabled-row logic unchanged

**Rationale:** The results table now presents unavailable enterprise integrations with softer product language while preserving the same degraded-state UX and implementation. Updating the frontend comment as well keeps the requested verification clean without altering runtime behavior.

---

## 2026-05-02

**style: restructure decision matrix into two separate tables with section labels and divider**

Changes shipped:
- Split single decision matrix table into two fully separate tables: Enterprise APIs and Open Source Models
- Each table has its own section label above it and its own full column header row (MODEL, CATEGORY, SEVERITY, CONFIDENCE, ALIGNMENT, ACTION)
- Added .matrix-section-label component: JetBrains Mono 10px uppercase var(--muted), padding 20px 0 10px 0
- Added .matrix-section-divider: 1px var(--border-strong) between the two sections
- Disabled model rows (.matrix-row-disabled) render at 0.4 opacity with "Not Configured" spanning remaining columns
- Fade-up animation index resets to 0 at start of each table
- Updated DESIGN.md Decision Matrix Table spec to reflect two-table structure

**Rationale:** Single table with internal tier header rows caused Enterprise and Open Source sections to visually intermingle. Two separate tables with independent headers creates clear visual separation matching the reference design pattern. Disabled enterprise models remain visible at reduced opacity to communicate unlock potential to visitors.

---

## 2026-05-02

**feat: integrate 4 enterprise APIs with 9-model parallel pipeline and graceful degradation**

Changes shipped:
- Add 4 enterprise API wrappers: Perspective API (Google), Azure Content Safety (Microsoft), AWS Comprehend (Amazon), Google NLP (Google)
- Expand analysis pipeline from 5 to 9 models running in parallel with per-model failure isolation
- Implement graceful degradation: models without configured credentials show "Not Configured" instead of errors
- Filter disabled models from consensus calculation, disagreement detection, and insight generation
- Update normalizer to handle disabled models with dedicated schema (disabled: True, action: "Disabled")
- Support dynamic model counts instead of hardcoding "5 models" — donut chart and status pill now reflect actual active count
- Restructure decision matrix into two tiers: Enterprise APIs (5 models) and Open Source Models (4 HuggingFace + OpenAI)
- Render tier headers with uppercase labels, disabled models shown at 0.4 opacity
- Add 4 new enterprise model detail cards to Models tab with strengths/limitations
- Create .env.example documenting all enterprise API credential requirements
- Add boto3 to requirements.txt for AWS Comprehend integration

**Rationale:** Enterprise moderation APIs enable larger organizations to plug in their preferred vendors while maintaining ModEval's comparative analysis. Graceful degradation ensures analysis continues even when credentials are missing, making the tool usable in any deployment scenario. Tier separation makes clear which models are cloud APIs vs. open source, guiding selection decisions.

**Testing approach:** Analysis runs end-to-end with zero enterprise credentials configured. All 5 HuggingFace models run normally, 4 enterprise show as "Not Configured". Consensus and insights generated only from active models. Donut chart reflects accurate active count.

---

## 2026-05-02

**style: navigation overhaul and lower tab system**

Changes shipped:
- Topbar expanded from 2 tabs (Analysis, Benchmark) to 4 tabs: Analysis, Benchmark (locked), How It Works, Models
- How It Works and Models moved from results panel tab strip to full-page panels accessed from topbar
- Old results-tabs strip removed entirely
- Results panel restructured with three lower tabs: Summary, Model Breakdown, Insights -- hidden until analysis runs
- Summary tab: consensus hero card, donut chart, severity gauge, action legend
- Model Breakdown tab: decision matrix table rendered directly, accordion wrapper removed
- Insights tab: strictest/most lenient cards and AI summary
- Donut chart and severity gauge added to verdict card with SVG-based rendering and JS population after results load
- Verdict action legend (REMOVE/REVIEW/ALLOW dots) added below gauge
- Removed breakdown accordion -- no longer needed with dedicated tab
- Multiple JS crash bugs fixed: duplicate const declarations, null addEventListener calls on removed tab elements, workspace display grid vs empty string conflict
- results-lower-tabs moved inside results-content for correct show/hide behavior
- AGENTS.md and CLAUDE.md updated with new component IDs and current project state

**Rationale:** Phase 0 of UX overhaul shifts navigation to topbar for discoverability, eliminates visual accordion complexity in favor of dedicated tabs, adds verdict visualization clarity with charts and gauge, and fixes architectural issues with panel visibility. Frontend now clearly separates analysis results (lower tabs) from methodology (topbar panels).

---

## 2026-05-01

**style: overhaul analysis results hierarchy and add benchmark placeholder**
- Added topbar navigation with `ANALYSIS` and a locked `BENCHMARK` entry that swaps between the main workspace and a standalone benchmark placeholder panel.
- Increased panel padding from `32px` to `48px` and raised the topbar height to `72px` with backdrop blur for more breathing room.
- Reworked the results view to lead with a new consensus hero card populated from `insights.consensus_recommendation` and the first two sentences of `ai_summary`.
- Wrapped the decision matrix in a collapsed-by-default `Model Breakdown` accordion while keeping the existing insight cards, disagreement banner, and AI summary logic intact.
- Added ambient blue and purple glow layers behind the results panel plus a locked benchmark preview surface with skeleton leaderboard and v2 feature cards.

**Rationale:** The frontend now prioritizes the most important moderation outcome first, reduces immediate visual density, and creates a clearer product path for future benchmark functionality without changing backend behavior or the existing analysis pipeline.

---

## 2026-04-29

**docs: Create comprehensive documentation system**
- Created `docs/ARCHITECTURE.md` with complete technical reference: folder structure, all API endpoints with request/response schemas, all 6 models with architecture/training data/strengths/limitations, Context Engine logic with threshold formulas, Policy Alignment scoring, Disagreement detection definitions, Platform modifiers table, Content Type modifiers table, Strictness modifiers table, Environment variables reference, Local development setup, Deployment details, Known limitations, Technology stack, File-by-file reference, Data flow diagram, Security considerations, Future extension points.
- Created `CLAUDE.md` with compressed codebase documentation (< 150 lines) for AI assistance: what the app is, tech stack, project structure, coding conventions, what not to touch, where to find things, self-updating meta instruction, commit format, task preparation checklist, never-do-without-asking rules, common task patterns, current state, known limitations.
- Updated `README.md`: Removed Project Structure, API Endpoints, Running Locally, Environment Variables, and Deployment sections (moved to `docs/ARCHITECTURE.md`). Kept public-facing content: What Is This, Why I Built This, What It Does, Models Used, Try an Example, Platform Policies, Methodology, UI Features, Tech Stack, Future Improvements, About the Builder.
- Created `PROGRESS.md` (this file) to track dated changelog entries.

**Rationale:** Documentation system allows future work to be faster by centralizing context. Long technical details moved to dedicated files, keeping README focused on public overview. CLAUDE.md enables AI to understand project quickly without reading 5 separate files. PROGRESS.md provides historical record of changes.

---
