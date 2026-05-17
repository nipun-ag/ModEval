# ModEval — Change Log

All dated entries document features, fixes, and documentation updates. Format: `[Date] Type: Description`

---

## 2026-05-17 (Part 3)

**feat: integrate 3 enterprise APIs (Hive, Azure, Google NLP), restructure AI analysis to 4-field insights**

Changes:
- Added three enterprise API wrappers: Hive Moderation (The Hive AI V3), Azure Content Safety (Microsoft), Google NLP (Google Cloud)
- Removed AWS Comprehend from active models (maintenance mode — wrapper remains but not in pipeline)
- Replaced Perspective API with Hive Moderation as the primary enterprise text moderation API
- Restructured AI analysis response from single `ai_summary` string to `ai_analysis` dict with 4 structured fields:
  - `disagreement_explanation`: string explaining why models disagreed (empty if consensus)
  - `risk_narrative`: string describing the severity and context of the content
  - `context_sensitivity`: string explaining how platform/content/strictness modifiers affect the verdict
  - `contested_category`: string naming the most disputed category across models
- Added Neutral as default platform context with 0.00 modifier (no strictness change)
- Updated response schema in `/analyze` endpoint to use `ai_analysis` field name
- Updated backend decision matrix to reflect 3 active enterprise APIs + 4 HuggingFace + OpenAI (8 total)
- Graceful degradation: disabled models show "Coming Soon" instead of errors

**style: redesign Insights tab with bento grid layout**

Changes:
- Replaced stacked insight cards layout with 12-column CSS bento grid (16px gap)
- Added 6 insight cards in grid layout:
  - Strictest Model card (6 columns)
  - Most Lenient Model card (6 columns)
  - Why Models Disagreed card (4 columns)
  - Risk Narrative card (8 columns wide)
  - Context Sensitivity card (8 columns wide)
  - Most Contested Category card (4 columns with accent background)
- Added CSS classes for bento grid and new insight card variants
- Responsive: collapses to 1 column on mobile (max-width: 900px)
- All cards use fade-up animation with staggered timing

**style: redesign How It Works panel with hero section, architecture flow, pull quote, equation block**

Changes:
- Added Section 1 header block with "STAGE" labels and section titles
- Added architecture flow component: icon circles with labeled connectors showing pipeline stages
- Added pull quote block ("Disagreements are not errors...") with italic styling and accent border
- Added equation block showing threshold calculation formula with color-coded operators and variables
- Added integrity cards checklist component with green checkmark bullets
- Restructured Section 2 with two-column text + code-window layout
- Added code-window component with macOS chrome (red/amber/green dots + filename)
- Simplified Section 7 to one-liner pointing users to Models tab
- Removed duplicate Policy Alignment Scoring section
- Wrapped Section 6.5 methodology content in methodology-card
- Fixed blank flash bug on model cards by adding GPU compositing to card elements

**docs: update DESIGN.md with new component documentation**

Changes:
- Added documentation for architecture flow components (.arch-flow-visual, .arch-flow-step, etc.)
- Added documentation for pull quote block (.pull-quote-block, .pull-quote-text)
- Added documentation for equation block (.equation-block, .equation-display, etc.)
- Added documentation for code-window components (.code-window, .code-window-dots, .code-dot)
- Added documentation for integrity card list (.integrity-card-list with green checkmarks)
- Added documentation for insights bento grid (.insights-bento, .insight-card-new, .ai-insight-card-new variants)
- Updated Decision Matrix Table spec to reflect new enterprise APIs

**docs: update ARCHITECTURE.md**

Changes:
- Updated Enterprise APIs section: replaced Perspective API with Hive Moderation, added Azure Content Safety and Google NLP as active
- Removed AWS Comprehend from active models (now in maintenance mode)
- Added Platform Modifiers section with Neutral (0.00) as default
- Updated AI analysis response schema to document `ai_analysis` dict with 4 fields instead of single `ai_summary`
- Updated Environment Variables section with HIVE_API_KEY, AZURE_CS_KEY, AZURE_CS_ENDPOINT, GOOGLE_NLP_KEY
- Updated Frontend Components section with Insights bento grid layout
- Updated How It Works panel documentation to reflect new sections and components

**docs: update CLAUDE.md Current Project State**

Changes:
- Updated model count: now 8 active models (3 enterprise APIs + 4 HuggingFace + OpenAI)
- Updated enterprise APIs list: Hive Moderation, Azure Content Safety, Google NLP (AWS Comprehend removed)
- Documented Neutral as default platform context
- Documented AI analysis as structured dict with 4 fields
- Updated Insights tab description to reflect bento grid layout with 6 cards

Rationale: Enterprise moderation APIs enable larger organizations to use their preferred vendors. Structured AI analysis allows frontend to display insights in tailored cards rather than free-form text. Bento grid layout provides better visual hierarchy and information density in Insights tab. Architecture flow and pull quote in How It Works improve pedagogical clarity.

---

## 2026-05-17 (Part 2)

**style: add bento grid CSS for Insights tab redesign**

Changes:
- Added `.insights-bento`: 12-column CSS grid with 16px gap for flexible card layouts
- Added `.insight-card-new`: base styles with 6-column span, animation stagger, hover effects
- Added `.ai-insight-card-new`: base styles with 4-column span, animation stagger, hover effects
- Added `.ai-insight-card-new--wide`: variant spanning 8 columns for Context Sensitivity card
- Added `.ai-insight-card-new--accent`: variant spanning 4 columns with accent color for Most Contested Category card
- Updated `.ai-insight-category`: changed font to DM Serif Display at 32px for visual prominence
- Added responsive media query: mobile (max-width: 900px) collapses all cards to 1 column with 12px gap
- All animations use staggered fade-up timing for sequential appearance
- Hover states include subtle translateY and box-shadow for interactivity
- Deployed on main branch

---

## 2026-05-17

**style: redesign Section 2 (Output Normalization) with code-window component**

Changes:
- Replaced Section 2 heading from "Output Normalization" to "Unified Output Normalization" with "STAGE 01" label
- Restructured Section 2 layout: two-column text + code block replaced with two-column editorial text + macOS-style code window
- Left column: paragraphs describing normalization process + integrity checklist (4 items with green checkmark bullets)
- Right column: code-window wrapper with header chrome (red/amber/green dots + filename) containing normalized output schema
- Added CSS classes to `frontend/style.css`:
  - `.code-window`: bordered container with box-shadow and border-radius
  - `.code-window-header`: flex layout with dots and filename styling
  - `.code-dot` with `.dot-red`, `.dot-amber`, `.dot-green` variants (macOS control colors)
  - `.code-window-filename`: monospace text styling
  - `.integrity-card-list`: flex column list with green checkmark bullets (✓)
- Updated `DESIGN.md` with documentation for code-window, code-dot, and integrity-card-list components
- Updated `docs/ARCHITECTURE.md` to reference Section 2's new structure in how-it-works-panel

---

## 2026-05-16

**feat: add Hive Moderation as enterprise API, replace Perspective API**

Changes:
- Created `backend/models/hive_moderation.py` wrapper for The Hive AI V3 Text Moderation API
- Added HIVE_API_KEY to `backend/config.py`
- Updated `backend/engine/normalizer.py` with Hive category aliases (bullying→harassment, drugs, weapon→violence)
- Registered Hive Moderation in `backend/routes/analyze.py` MODEL_RUNNERS, replacing Perspective API in Enterprise APIs tier
- Replaced Perspective API model card with Hive Moderation in frontend (5 dimension detections, V3 free tier limits documented)
- Updated `docs/ARCHITECTURE.md` with Hive API endpoint, auth method, output schema, and environment variable
- Updated `INFRASTRUCTURE.md` to reflect HIVE_API_KEY as configured secret, Perspective API as replaced
- Perspective API wrapper file remains in codebase but is no longer active
- Graceful degradation working: missing HIVE_API_KEY shows model as "Coming Soon" in decision matrix

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
