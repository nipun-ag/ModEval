# ModEval — Change Log

All dated entries document features, fixes, and documentation updates. Format: `[Date] Type: Description`

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
