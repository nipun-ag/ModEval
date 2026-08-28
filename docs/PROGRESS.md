# ModEval — Change Log

All dated entries document features, fixes, and documentation updates. Format: `[Date] Type: Description`

---

## 2026-08-15

**feat: add social preview banner metadata**

- Added Open Graph and Twitter card metadata to the React/Vite HTML shell.
- Wired the new ModEval Vercel Blob banner as the canonical social preview image.
- Verified the banner URL returns a public PNG and confirmed `npm run build` passes.

---

## 2026-07-24

**style: enlarge How It Works pipeline diagram scale and spacing**

- Scaled trunk nodes (220×64), titles (15px), subtitles (11px), and 8-lane fan-out boxes (84×54, 11px labels, 10px gaps) inside a wider 780×1380 viewBox; kept single-row fan-out (no 4+4 wrap)
- Increased vertical stage gaps and connector stroke/pulse dash sizes so lines stay proportional
- Raised side-by-side drawer breakpoint from 1160 → 1280 (`FLOW_DRAWER_SIDE_BY_SIDE_MIN`) because diagram shell (~780) + pad (~32) + drawer (~448) no longer fits cleanly at 1160; panel max-width raised to 1320 so the column does not center under the drawer before the breakpoint
- Playwright `setViewportSize` re-check at 768/1024/1160/1280/1440: overlay below 1280, side-by-side at/above with ≥20px shell–drawer clearance; page scrolls for taller diagram; `tsc -b && vite build` passes
- Follow-up copy/legibility: Why These Models diagram subtitle → `model selection rationale` (drawer copy unchanged); FAN-OUT label moved above the H fan-out lines with a solid dark pill so dashes no longer cut through the text

---

## 2026-07-19

**chore: remove unused batch endpoint, Flask static UI serving, and no-op request fields**

- Removed dead `enforced_action` locals, unused `PLATFORM_MAP` import, and unreachable `"generic"` branch from `policy_engine.py` (no behavior change for Reddit/Discord/Facebook/Instagram/Custom)
- Deleted `POST /batch-analyze` (`backend/routes/batch.py`) and its blueprint registration; removed batch-only `MAX_BATCH_SIZE`
- Flask is now API-only: removed `GET /` and `GET /og-image.png` static handlers (UI served by Vercel)
- Removed `content_type` / `strictness` from frontend request payload and backend `/analyze` handling (were accepted but unused in Claude prompt construction)
- Intentionally kept response fields unused by current UI: `flagged`, `insights.*.action`, `total_count`
- Confirmed `/analyze`, `/models`, `/health` remain the supported surface; docs updated in ARCHITECTURE.md, CLAUDE.md, AGENTS.md
- Local verification (cleaned code on Flask `:5055`): `GET /health` ok; `GET /models` returns `total_count`; `POST /analyze` without `content_type`/`strictness` returns 8 results with KEEP fields present; `POST /batch-analyze`, `GET /`, `GET /og-image.png` all 404. Live API still serves batch until Hetzner redeploy.

---

## 2026-06-29

**docs: post-migration cleanup — stale subdomain references and DNS notes**

- Audited all .md files for stale api.modeval.bynipun.com references
- Updated CLAUDE.md and docs/ARCHITECTURE.md with correct subdomain
- Added Cloudflare DNS cleanup note for stale A record
- Added explanation for modeval-api subdomain naming decision (wildcard cert coverage)
- Manual action still required: delete api.modeval.bynipun.com A record from Cloudflare DNS dashboard

---

## 2026-06-29

**infra: rename API subdomain from api.modeval.bynipun.com to modeval-api.bynipun.com**

- Cloudflare wildcard cert only covers one subdomain level (*.bynipun.com)
- api.modeval.bynipun.com was three levels deep and not covered by wildcard
- modeval-api.bynipun.com is two levels deep and covered by wildcard
- Updated API_BASE in frontend/app.js
- Updated all references in INFRASTRUCTURE.md

---

## 2026-06-29

**chore: remove unnecessary vercel.json**

- Vercel requires no config file for a plain static site
- Root directory (frontend/) will be set in the Vercel dashboard
- vercel.json deleted from repo root

---

## 2026-06-29

**infra: split frontend to Vercel, backend API to api.modeval.bynipun.com**

- frontend/app.js: added API_BASE constant pointing to api.modeval.bynipun.com; updated all fetch() calls to use it
- backend/requirements.txt: added flask-cors
- backend/app.py: imported and configured CORS scoped to modeval.bynipun.com and localhost origins
- vercel.json: created at repo root for Vercel static deployment of frontend/ directory
- INFRASTRUCTURE.md: updated hosting table and request flow for split architecture; added post-migration Nginx/DNS steps
- CLAUDE.md, docs/ARCHITECTURE.md: updated deployment documentation

Manual steps still required after this commit:
- Cloudflare: add A record for api.modeval.bynipun.com → 178.105.93.92
- Cloudflare: update modeval.bynipun.com to point to Vercel
- Hetzner Nginx: update server_name to api.modeval.bynipun.com
- Hetzner: run certbot for api.modeval.bynipun.com
- Vercel: create project pointing at this repo, set root to frontend/

---

## 2026-06-29

**docs: correct deployment documentation to reflect actual hosting state**

- INFRASTRUCTURE.md: removed stale Vercel row from hosting table, corrected request flow to include Cloudflare edge layer, updated section header to reflect Flask serving both API and frontend, added Cloudflare Configuration section, noted absence of Nginx static-file location block
- CLAUDE.md: updated deployment bullet to clarify Flask serves frontend
- docs/ARCHITECTURE.md: updated Deployment section to match

---

## 2026-05-21 (Phase 3 Part 1)

**infra+fix: security and operational hardening — rate limiting, headers, API key exposure fix**

Infrastructure changes (server-side, not in git):

Cloudflare:
- Enabled Cloudflare proxying (orange cloud) for modeval.bynipun.com — real server IP (178.105.93.92) is now hidden from public DNS
- Upgraded SSL/TLS mode from Full to Full (Strict) — Cloudflare now verifies the origin Let's Encrypt certificate is valid
- Enabled Always Use HTTPS — all HTTP requests redirected to HTTPS at Cloudflare edge before reaching the server

Nginx (/etc/nginx/nginx.conf):
- Added two rate limiting zones using $http_cf_connecting_ip (Cloudflare real IP header, not $remote_addr which would be Cloudflare's own IP):
  - analyze_limit: 10 requests/minute for /analyze and /batch-analyze
  - general_limit: 60 requests/minute for all other routes

Nginx (/etc/nginx/sites-available/modeval):
- Added client_max_body_size 16k — oversized POST bodies rejected before reaching Flask (verified: returns 413)
- Added proxy timeouts: connect 10s, send 30s, read 30s
- Added security headers on all responses:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy: strict-origin-when-cross-origin
  - X-XSS-Protection: 1; mode=block
- Added strict rate limiting on /analyze (burst=3) and /batch-analyze (burst=2) with 429 status on violation
- Added general rate limiting on all other routes (burst=20)
- Updated X-Real-IP header to use $http_cf_connecting_ip so Flask sees real visitor IP, not Cloudflare's IP
- Backed up original config to modeval.backup before changes

Code change (in git, commit 7dcc80f):
- fix: moved Google NLP API key from URL query parameter to X-Goog-Api-Key request header in backend/models/google_nlp.py — key was previously visible in Nginx access logs, systemd journal, and any proxy logs

Verification:
- curl -I: all four security headers confirmed present
- Rate limit test (15 requests): 429s firing after burst exceeded
- Oversized request test (20,000 chars): 413 returned correctly
- Site remains live at modeval.bynipun.com throughout

---

## 2026-05-21 (Phase 4)

**refactor: dead code removal — unused import and parameters**

Code changes (in git, commit d64f3bd):

- `backend/engine/policy_engine.py`: Removed unused `import re` statement (line 7) — imported but never used in the file
- `backend/engine/explainer.py`:
  * `build_context_summary()` signature: Removed unused parameters `platform_context`, `content_type`, `strictness` — function only uses `thresholds`
  * `explain_result()` signature: Removed unused parameters `platform_context`, `content_type`, `strictness` — function only uses `result`, `thresholds`, `policy_note`
  * Updated call to `build_context_summary()` to pass only `thresholds` parameter
- `backend/routes/analyze.py`: Updated both calls to `explain_result()` to pass only 3 arguments (result, thresholds, policy_note) instead of 6

Verification:
- No regex module calls found in policy_engine.py
- Function signatures match expected parameters only
- Flask app starts without import errors
- All 3 files committed together

---

## 2026-05-21 (Phase 3 Part 2)

**fix: Flask backend security hardening — timeout enforcement and error sanitization**

Code changes (in git, commit 38282ab):

Config centralization:
- `backend/config.py`: Added `ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")` constant so it's loaded once at startup, not repeatedly via os.getenv() in request handlers

Timeout enforcement:
- `backend/engine/policy_engine.py`: 
  * Added `timeout=25.0` parameter to `client.messages.create()` call for Claude Haiku API calls
  * Removed `import os`, added `import logging`
  * Replaced `os.getenv("ANTHROPIC_API_KEY")` with direct use of `ANTHROPIC_API_KEY` constant from config
- `backend/routes/analyze.py`:
  * Added `timeout=25.0` parameter to `client.messages.create()` call for Claude Haiku API calls
  * Added `timeout=25` parameter to `ThreadPoolExecutor.as_completed()` to enforce 25-second hard limit on parallel model execution
  * Wrapped model execution loop with try/except TimeoutError to gracefully handle timeout by returning incomplete futures with sanitized "Service temporarily unavailable" error
  * Removed `import os`, added `import logging`, added `TimeoutError` to concurrent.futures imports
  * Replaced `os.getenv("ANTHROPIC_API_KEY")` with direct use of constant

Exception sanitization:
- All routes now use `logging` instead of `print()` for both success and error messages — errors logged server-side as "AI Analysis/Alignment failed: {exception}" while users see sanitized "Service temporarily unavailable" messages
- `backend/routes/analyze.py`: Replaces raw exception strings in model error results with "Service temporarily unavailable"
- `backend/app.py`: Added global error handlers for 400, 404, 429, 500 status codes returning JSON with generic error messages (no stack traces or implementation details exposed to clients)

Impact:
- Request timeouts now enforced at Flask application layer (25s for Anthropic API calls, 25s for model parallel execution)
- Layered timeout protection: Cloudflare → Nginx proxy → ThreadPoolExecutor → Anthropic SDK (all set to 25-30s window)
- Errors logged server-side with full details, but only sanitized messages sent to clients
- Structured logging enables better monitoring and debugging without exposing security/privacy information

---

## 2026-05-21

**docs: fix documentation drift identified in codebase audit**

- INFRASTRUCTURE.md: corrected hosting table — frontend is served by Flask/Gunicorn on Hetzner, not Vercel; updated opening statement to reflect that entire app is self-hosted
- docs/ARCHITECTURE.md: clarified CORS rationale (same-origin via Flask static serving, not separate Vercel frontend)
- CLAUDE.md + AGENTS.md: corrected threshold behavior claim in "What NOT to Touch" section (context_engine.py has no clamping, returns fixed thresholds only; platform policy judgment belongs in policy_engine.py)

---

## 2026-05-20

**style: fix mobile horizontal overflow and right-edge clipping**

- `frontend/style.css`: Comprehensive mobile overflow pass — `min-width: 0` on flex/grid children, mobile-only universal shrink rule, replaced `100vw` with `100%`, stacked breakdown fields (column under 900px), fixed `.insights-alignment-reason` mobile selector (was wrong class), insights matrix/confidence bar mobile stacking, `overflow-wrap: anywhere` for long URLs/unbroken strings/AI rationale, methodology table `table-layout: fixed` with scroll containment, arch-flow label wrapping.
- QA: Verified at iPhone SE (375px), iPhone 14 Pro (393px), and Galaxy S21 (360px) target widths via stress-test fixture + live analysis flow (landing, results, breakdown, insights, methodology, models); zero horizontal page scroll, no right-side clipping.
- Impact: Mobile layouts contain long content correctly; desktop layout unchanged.

---

## 2026-05-19 (Late Night)

**fix: reframe model results in AI prompts -- system assigns actions, models return scores only**

- `backend/routes/analyze.py`: Updated model_lines loop to present `confidence` as primary signal, `system_action` as threshold-derived consequence, and renamed `alignment` → `policy_alignment`. Updated instruction #3 to clarify that Allow/Review/Remove are system-assigned based on confidence thresholds, not model decisions.
- `backend/engine/policy_engine.py`: Updated model_results_json to use `system_action` field with explanatory note. Rewrote "Rules for your assessment" block to explain that models produce confidence scores only; the system applies threshold logic to assign actions. Claude now evaluates whether confidence is appropriate, not whether the model "decided" correctly.
- Why: Previous framing misled Claude into treating system-assigned actions as model outputs. Low-confidence models were mischaracterized as "failing to decide to allow" rather than "failing to detect content." New framing separates signal (confidence) from decision (system action) cleanly.
- Impact: AI Interpretation tab (Disagreement Vector, Alignment Matrix) now reasons about confidence appropriately. No schema changes, no logic changes, only prompt text.

---

## 2026-05-19 (Night)

**refactor: batch 1 dead code removal — config constants, CSS bento tree, stale HTML, severity gap UI**

- `backend/config.py`: removed `MIN_THRESHOLD`, `MAX_THRESHOLD`, `PLATFORM_MODIFIERS`, `CONTENT_TYPE_MODIFIERS`, `STRICTNESS_MODIFIERS` — all were defined but never read by any code path post-refactor
- `frontend/style.css`: removed `.topbar-nav-item.locked` (no locked nav items exist), `.context-explainer-link`/`:hover` (class not applied anywhere in HTML), entire `.insights-bento` tree (~150 lines: `.insights-bento`, `.insight-card-new` variants, `.ai-insight-card-new` variants, responsive overrides) — static HTML was overwritten by `renderInsights()` before it was ever visible
- `frontend/index.html`: removed static `<div class="insights-bento">` block (6 article cards with ghost IDs referenced by nothing), removed `<tr>Severity Gap</tr>` from How It Works disagreement table — severity field was removed from the entire codebase in a prior session
- `docs/ARCHITECTURE.md`: removed `MIN_THRESHOLD` / `MAX_THRESHOLD` from base thresholds code block — matches actual config.py state
- No logic changed. No rendered output affected. All deletions verified by pre- and post-deletion grep passes.

---

## 2026-05-19 (Late Evening)

**feat: remove Benchmark tab and all associated code**

Changes:
- Removed `nav-benchmark` link from topbar navigation (frontend/index.html)
- Deleted entire `#benchmark-panel` div and all child elements (coming-soon state, skeleton table, lock overlay, feature preview cards)
- Removed `benchmarkPanel` variable declaration from app.js
- Removed `setPrimaryView()` function logic that handled benchmark tab switching
- Removed `navBenchmark` variable and event listener for nav-benchmark clicks
- Removed 'benchmark-panel' from showPanel() panels array
- Deleted all benchmark-related CSS rules from style.css:
  - `#benchmark-panel`, `.benchmark-heading`, `.benchmark-subheading`
  - `.benchmark-preview-container`, `.benchmark-skeleton-table`, `.benchmark-skeleton-head`
  - `.benchmark-lock-overlay`, `.benchmark-lock-card`, `.benchmark-lock-icon`, `.benchmark-lock-title`, `.benchmark-lock-body`
  - `.benchmark-preview-grid`, `.benchmark-preview-card`, `.benchmark-preview-eyebrow`, `.benchmark-preview-title`, `.benchmark-preview-body`
  - Removed responsive CSS rules for #benchmark-panel and .benchmark-lock-card in 900px media query
  - Removed `.benchmark-preview-grid` reference from responsive grid selector

Why:
- Benchmark feature is deferred indefinitely; removing all dead code
- Cleaner UI with 3-tab topbar (ANALYSIS, HOW IT WORKS, MODELS) vs 4-tab
- Zero references to benchmark-panel in DOM, JavaScript, or CSS
- Reduces bundle size and cognitive load

Verification:
- `grep -i "benchmark" frontend/` returns 0 results for feature-related code
- Topbar shows exactly 3 nav items, no BENCHMARK item
- No JavaScript errors on page load
- Navigation to remaining 3 tabs works correctly

---

## 2026-05-19 (Evening)

**style: fix AI Interpretation grid equal-height alignment**

Changes:
- Added `align-items: stretch` to `.insights-grid` to enforce grid item stretching
- Added `height: 100%` and `box-sizing: border-box` to `.insights-card-tall` (removed `min-height: unset` and `grid-row: 1 / 3`)
- Added `height: 100%` to `.insights-grid-right` flex container
- Result: left tall card (Disagreement Vector) and right stacked cards (Most Lenient + Strictest Model) now always equal in height

Why:
- Grid columns were not stretching to fill available height; `.insights-card-tall` did not grow to match `.insights-grid-right`
- CSS Grid `align-items: stretch` works on grid items (immediate children), but `.insights-card-tall` content needed explicit `height: 100%`
- Right flex container needed explicit height to expand with left card

Verification:
- Tested with analysis run; both columns measured 463.125px height (verified via getBoundingClientRect)
- Grid alignment now consistent regardless of content length in disagreement explanation

---

## 2026-05-19

**style/refactor: pre-launch polish pass -- severity removal, UI refinements, doc accuracy**

Changes:
- Removed severity field completely from entire codebase (normalizer.py, comparison.py, all frontend rendering, CSS)
- Removed score_to_severity() function from normalizer.py
- Removed severity_gap disagreement detection from comparison.py
- Removed severity gauge from Summary tab verdict visuals
- Removed severity bar column from Model Breakdown cards
- Skeleton loading state redesigned to match Summary tab layout (single circle, no 8-row table)
- Verdict visuals card box border removed; donut chart renders clean without container
- HuggingFace model display names updated to actual model names: toxic-bert, RoBERTa Offensive, RoBERTa Hate Speech, DistilRoBERTa Bias
- AI Interpretation top grid restructured to 3 cards: Disagreement Vector (tall left), Most Lenient (top right), Strictest Model (bottom right); Risk Narrative removed
- MODEL CONFIDENCE header added above confidence bars in Executive Summary, centered
- Summary tab subtitle now shows vote-based consensus text instead of AI narrative
- Platform policy box made collapsible, footer copy updated to "Guidelines sourced from official platform documentation. Last verified May 2026."
- Insights tab renamed to AI INTERPRETATION; Claude Haiku disclaimer banner added
- How It Works panel fully corrected: fixed threshold formula, removed platform modifiers table, updated Platform Context table, stale gaming/professional platform references removed, unicode icons replaced with SVGs, arch flow circle borders removed
- risk_narrative prompt updated to prevent Claude from prefixing narrative with verdict label
- Model Breakdown card columns fixed: CATEGORY and CONFIDENCE evenly spaced with aligned headers
- CSS: insights grid right column cards now divide space equally with flex: 1, min-height 160px, display flex, flex-direction column, justify-content space-between

Why:
- Severity was a redundant rescaling of confidence (0-1 to 1-10) that added visual noise without analytical value
- Display names now match actual model identifiers for technical credibility with target audience
- How It Works was documenting removed features (platform modifiers, severity scaling); now accurate
- UI polish pass ahead of public launch on Reddit, X, and LinkedIn

Tradeoffs:
- Severity gap disagreement detection removed along with severity field; action_mismatch and category_mismatch cover the meaningful disagreements
- Custom display names for HuggingFace models replaced with technical names; less friendly but more accurate for technical audience

---

## 2026-05-18

**style: rework AI Interpretation top grid to 3-card layout, add model confidence header**

Changes:
- Restructured insights-grid layout in renderInsights() (app.js):
  - Moved Disagreement Vector to left column as tall card spanning full height
  - Created flex column wrapper on right with Most Lenient (top) and Strictest (bottom) stacked vertically
  - Removed Risk Narrative card entirely
- Updated .insights-grid-right CSS: changed from grid (2 columns) to flex (column direction)
- Added MODEL CONFIDENCE header above confidence bars in insights-ai-section
- Created .insights-bars-header CSS class: JetBrains Mono 10px uppercase, --muted color, 8px margin-bottom, 0.08em letter-spacing

Why:
- New 3-card layout emphasizes disagreement (left tall card) while showing model extremes (right stack)
- Removing Risk Narrative reduces redundancy (already covered in executive summary)
- Header improves visual hierarchy and clarity of the confidence metrics section

Tradeoffs:
- Disagreement Vector now takes up more visual prominence (intentional — shows what models disagree on)
- Risk Narrative removed (consolidated into AI executive summary section)

---

## 2026-05-18

**style: polish AI Interpretation disclaimer -- SVG icon, improved legibility**

Changes:
- Replaced ⓘ text character with inline SVG info icon (circle with line, stroke-based, inherits opacity 0.6)
- Simplified disclaimer text: removed model version string "(claude-haiku-4-5-20251001)" and rephrased for clarity
- Updated .ai-interpretation-disclaimer CSS: font-size 11px → 12px, color --text-secondary → --text
- Added subtle left border accent: border-left: 2px solid var(--border-strong)
- Removed now-unused .disclaimer-icon CSS class

Why:
- SVG icon renders cleanly and scales with current color (respects opacity)
- Removing model version simplifies the UI without losing clarity
- Larger, brighter text improves readability
- Left border accent draws attention without being alarming

Tradeoffs:
- Inline SVG adds slight HTML volume to generated content (minimal)
- Text is now slightly more prominent (intentional improvement)

---

## 2026-05-18

**fix: inject disclaimer via JS in renderInsights to survive innerHTML overwrite**

Changes:
- Moved AI Interpretation disclaimer from static HTML in index.html to dynamic injection in renderInsights() function
- Disclaimer now constructed as disclaimerHTML string and prepended to gridHTML before setting insightsContainer.innerHTML
- Removed static `<div class="ai-interpretation-disclaimer">` from index.html lower-panel-insights
- Disclaimer persists across every analysis render because it's regenerated each time

Why:
- Previous implementation placed disclaimer as static HTML, which was immediately overwritten by renderInsights() at line 1090
- Dynamic injection ensures disclaimer appears on every analysis execution
- More robust than static HTML approach

Tradeoffs:
- Disclaimer is now regenerated for each analysis (negligible performance impact)
- All disclaimer content is now in JS rather than HTML (standard pattern for dynamic content)

---

## 2026-05-18

**feat: rename Insights tab to AI Interpretation, add Claude Haiku disclaimer**

Changes:
- Renamed the "Insights" tab to "AI INTERPRETATION" in the lower-tab strip (lower-tab-insights ID unchanged)
- Added a disclaimer banner as the first child of lower-panel-insights panel:
  - Info icon (ⓘ) prefix with neutral styling
  - Text: "Interpreted by Claude Haiku (claude-haiku-4-5-20251001). AI interpretation is probabilistic and may contain errors — it is intended to assist human review, not replace it."
  - Styling: --surface2 background, --border border, 11px italic --text-secondary Inter font, 6px border-radius, 10px 14px padding
- Added `.ai-interpretation-disclaimer` and `.disclaimer-icon` CSS classes for the new component

Why:
- Rename clarifies the Insights tab's purpose: it shows AI-powered interpretation of results, not human insights
- Disclaimer banner establishes appropriate expectations around Claude Haiku's output
- Explicitly states that AI interpretation assists but doesn't replace human review
- Positions responsibility: Claude provides analysis, humans make decisions

Tradeoffs:
- Adds visual element to Insights tab that slightly increases vertical space
- Disclaimer takes up space but is necessary for transparency about AI-generated content

---

## 2026-05-18

**feat: collapsible platform policy box, update footer copy**

Changes:
- Modified `updatePlatformPolicyBox()` in app.js to render platform policy guidelines in a collapsible structure
- Added `.platform-policy-header` button element with label and chevron icon
- Wrapped policy rules in `.platform-policy-content` div that collapses with smooth CSS transition
- Added event listener to header button that toggles `aria-expanded` attribute and `collapsed` class
- Chevron icon rotates 180° when expanded (CSS: `.platform-policy-header[aria-expanded="true"] .platform-policy-chevron`)
- Default state on page load: collapsed (aria-expanded="false", max-height: 0)
- Updated footer text from "These rules are used by the AI interpretation model to assess alignment of moderation results." to "Guidelines sourced from official platform documentation. Last verified May 2026."
- Added CSS for collapsible behavior with smooth 0.2s max-height transition
- #platform-policy-box ID preserved — app.js continues to update content within this element when platform changes

Why:
- Reduces visual clutter in the input panel by hiding policy rules by default
- Users can expand rules on-demand to review platform-specific guidelines
- New footer text reflects the sourced nature of the guidelines without claiming direct AI use in policy logic
- Chevron rotation provides clear visual feedback for collapse/expand state

Tradeoffs:
- Policy rules now hidden by default; users must click to see them (vs. always visible)
- Smooth transition adds slight delay when toggling (0.2s), but improves visual polish

---

## 2026-05-18

**refactor: remove platform threshold modifiers, use fixed base thresholds**

Changes:
- Removed threshold_modifier field from all 5 platform entries in PLATFORM_MAP (backend/config.py)
- Simplified calculate_context_adjustment() in backend/engine/context_engine.py to always return BASE_REVIEW_THRESHOLD (0.40) and BASE_REMOVE_THRESHOLD (0.70)
- Removed all modifier logic, platform lookups, content_type_modifiers, strictness_modifiers, and clamping from context_engine.py
- Function signature unchanged so all call sites continue to work without modification
- No changes to analyze.py needed — it calls calculate_context_adjustment but never directly reads threshold_modifier

Why:
- Claude Haiku's AI-powered alignment assessment already handles platform-specific policy judgment
- Pre-threshold adjustments distort the raw model signal before Claude can evaluate them in proper context
- Simplified threshold logic reduces cognitive load on maintainability
- Clearer separation of concerns: models → normalization → Claude policy judgment (not threshold tweaking before Claude)

Tradeoffs:
- All platforms now use identical thresholds; platform context is handled purely through Claude alignment assessment
- Removed ability to adjust thresholds per content type or strictness; these inputs are still accepted but ignored
- Historical behavior changes: platforms previously had modifiers (Discord +0.05, etc.) which are now removed

---

## 2026-05-18

**feat: add pre-filled template to custom policy textarea**

Changes:
- Defined CUSTOM_POLICY_TEMPLATE constant in frontend/app.js with three structured sections: ZERO TOLERANCE, DEPRIORITIZE, CONTEXT
- Modified STATE_MAP platform handler to auto-fill custom_policy_text textarea when "Custom" platform is selected
- Template only applies if textarea is empty (checked with .value.trim() === ""), preserving any existing user content
- When users switch away from Custom and back, existing content is preserved and template does not overwrite it

Why:
- Reduces friction for first-time users by providing a clear policy structure template
- Helps users understand expected policy format with examples and placeholder text
- Content preservation ensures users don't lose work when navigating between platforms

Tradeoffs:
- None; pure UX improvement with full content preservation

---

## 2026-05-18

**feat: redesign insights tab with asymmetric layout and elevated AI summary**

Changes:
- Insights tab completely redesigned with three-section asymmetric layout:
  - Top grid: Strictest/Most Lenient model comparisons (2 cards) + Disagreement Explanation (1 card) + Risk Assessment (1 card)
  - Alignment assessment matrix: Restyled policy alignment assessment with ALIGNED/MISALIGNED badges, model names, and alignment reasons
  - Elevated AI executive summary card: Gradient teal/purple border with radial glow effect, consensus badge showing consensus action, auto-classified finding tag, AI narrative, and per-model confidence bars
- Finding tags auto-classify content based on consensus action: CLEAR VIOLATION (red) for Remove, SAFE CONTENT (green) for Allow, AMBIGUOUS (grey) for Review
- Confidence bars visualize each active model's conviction level with smooth teal-to-purple gradient fill
- New CSS classes added for three-section layout: insights-grid, insights-grid-item, insights-alignment-section, insights-matrix, insights-ai-section, insights-finding-tag, insights-confidence-bars, etc.
- renderInsights() function completely rewritten to build new three-section layout instead of old bento grid
- Added renderFindingTag() helper to auto-classify violations based on consensus action
- Added renderConfidenceBars() helper to render per-model confidence visualization
- Added renderInsightsMatrix() helper to wrap alignment assessment with new styles
- Insights AI section uses existing CSS variables (teal #5eeac4, purple #8b5cf6) for consistent branding
- Context Sensitivity and Most Contested Category cards removed from display (old bento cards no longer rendered)
- AI analysis section moved inside Insights panel structure with proper hierarchy
- lastAnalyzedText tracking added to capture submitted content for context-aware rendering

Why:
- Three-section layout provides clear information hierarchy: model comparisons → alignment → AI interpretation
- Elevated AI summary card emphasizes the Claude-powered analysis as the executive endpoint
- Confidence bars provide quick visual comparison of model certainty across all models
- Finding tags reduce cognitive load by auto-labeling severity (violation/safe/ambiguous) instantly
- Gradient border and glow effect on AI section visually distinguishes it as elevated/authoritative
- Simplified card layout removes redundant severity/context cards, focusing on actionable insights

Tradeoffs:
- Removed Context Sensitivity and Most Contested Category cards (was redundant with AI summary narrative)
- Alignment matrix now integrated into Insights rather than separate section (more compact but fewer scrolls)
- Finding tags are automated rather than manually tagged (sacrifices flexibility for consistency)

---

## 2026-05-17 (Part 5)

**docs: finalize platform reduction, Claude Haiku alignment, UI component documentation**

Changes:
- Platform options finalized to 5: Reddit, Discord, Facebook, Instagram, Custom (Gaming Platform, Professional, Community/Forum, VR/Metaverse fully removed)
- PLATFORM_MAP in config.py cleaned to match 5 active platforms only
- Content Type and Strictness dropdowns removed from UI entirely; backend defaults to "Original Post" and "Balanced" if not provided
- evaluate_alignment_with_ai() in policy_engine.py now makes single batched Claude Haiku call (claude-haiku-4-5-20251001) to assess alignment for all active models simultaneously
- Each alignment result includes: aligned (bool), alignment_score (float), alignment_reason (string referencing actual content)
- Original text passed to alignment call so reasons reference actual content being analyzed, not just category labels
- max_tokens increased from 600 to 1200 for alignment call; robust JSON array extraction added to handle Claude responses with extra text
- Fallback to keyword-based evaluate_policy_alignment() if Claude call fails
- generate_ai_analysis() in analyze.py switched from gpt-4o-mini to claude-haiku-4-5-20251001 via Anthropic SDK
- Both interpretation calls now use Anthropic SDK — anthropic package added to requirements.txt
- ANTHROPIC_API_KEY required in Doppler (project: modeval, config: prd) — already configured
- get_platform_policy_summary() cleaned up — removed 4 stale platform entries, kept only 5 active platforms
- ALIGNMENT ASSESSMENT section added to Insights tab showing all model alignment verdicts and reasons with footer "Alignment assessed by Claude Haiku against [platform] content policy."
- Alignment column removed from Model Breakdown tab — breakdown cards now show CATEGORY, SEVERITY, CONFIDENCE, ACTION only
- Context explainer blurb added above Platform selector with link to How It Works tab
- Platform policy guidelines box added below Platform selector showing actual policy rules for selected platform, updates dynamically
- Platform selector simplified to 5 options with modal dropdown showing platform name + description
- Alignment footer corrected to "Claude Haiku" from "GPT-4o-mini"

Why:
- Reducing to 5 platforms focuses the tool on real, widely-used platforms with documented policies
- Claude Haiku provides sufficient T&S capability at lower cost for both alignment and summary generation
- Passing original text to alignment enables content-aware policy assessment rather than generic category matching
- Single batched call is more efficient than per-model evaluation
- Removing alignment column from Model Breakdown simplifies the card layout; alignment is now consolidated in Insights tab
- Platform policy box and context explainer improve UX by making platform selection purpose clear

Tradeoffs:
- Removed 4 platform options reduces flexibility but eliminates speculative enforcement profiles
- Alignment reasons now reference actual content which is more useful but depends on Claude's text understanding quality

---

## 2026-05-17

**feat: switch interpretation layer to Claude Haiku, pass text context to alignment**

Changes:
- Updated evaluate_alignment_with_ai() signature to accept text parameter for context-aware assessment
- Updated alignment system prompt to reference actual content being evaluated, not just categories
- Alignment reasons now explicitly flag model failures (e.g., 0.00 confidence on harmful content) and acknowledge ambiguous content
- Switched alignment assessment from GPT-4o-mini to Claude Haiku (claude-haiku-4-5-20251001) for efficiency
- Updated alignment API call to use Anthropic client.messages.create() instead of OpenAI chat.completions.create()
- Switched AI summary/analysis generation from GPT-4o-mini to Claude Haiku (claude-haiku-4-5-20251001)
- Updated AI analysis API call to use Anthropic client with system role
- Added anthropic>=0.28.0 to requirements.txt
- Added inline comments noting ANTHROPIC_API_KEY requirement in Doppler (project: modeval, config: prd)
- OpenAI still used for 8 moderation model API calls (openai_moderation.py) — unchanged

Why:
- Passing original text to alignment assessment enables more accurate policy matching against actual content rather than just category labels
- Claude Haiku provides sufficient capability for Trust & Safety interpretation at lower cost and faster inference than GPT-4o-mini
- Context-aware alignment flags model failures and ambiguity explicitly, improving interpretability
- Both interpretation calls (alignment + analysis) now use Anthropic's unified family for consistency

---

## 2026-05-17

**feat: upgrade AI summary to senior T&S analyst interpretation**

Changes:
- Replaced basic summarization prompt with senior Trust & Safety analyst persona in generate_ai_analysis()
- Updated system prompt to emphasize analytical insight over model summarization
- New instructions focus on: identifying violation severity (clear/safe/grey), explaining disagreements, flagging model failures, recommending human review, and explicitly calling out grey areas
- Updated user message to include original analyzed text and detailed model results with alignment verdicts
- Restructured JSON output fields to request direct analytical assessment instead of passive summary:
  - disagreement_explanation: now asks "what does disagreement reveal?" instead of "why did models disagree?"
  - risk_narrative: now asks for direct verdict (CLEAR VIOLATION/SAFE/GREY AREA) with explanation
  - context_sensitivity: now asks whether human review is needed and if policy is clear enough
  - contested_category: remains category name or "None"
- Increased max_tokens from 300 to 400 to accommodate deeper analysis

Why:
- Basic summarization doesn't help Trust & Safety teams; they need analytical interpretation
- Flagging model failures and grey areas explicitly improves decision quality
- Human review recommendations make results actionable
- Senior analyst persona creates authoritative tone matching platform's needs
- Including original text allows model to contextualize its analysis

---

## 2026-05-17

**feat: simplify platform options to 5 and update policy content with sourced guidelines**

Changes:
- Removed 4 platforms from PLATFORM_MAP in config.py: Gaming Platform, Professional, Community/Forum, VR/Metaverse
- Removed dropdown options for those 4 platforms from frontend/index.html
- Removed PLATFORM_POLICIES entries for those 4 platforms from frontend/app.js
- Updated PLATFORM_POLICIES with accurate sourced rules for Reddit (7 official rules), Discord (8 platform rules), Facebook (8 community standards), Instagram (8 community standards), and Custom (2 explanatory rules)
- Platform selector now shows exactly 5 options: Reddit, Discord, Facebook, Instagram, Custom
- Policy box continues to display accurate guidelines for selected platform

Why:
- Focused platform set (5 instead of 9) reduces complexity and cognitive load
- Sourced rules directly reflect official platform guidelines rather than approximations
- Removes speculative enforcement profiles for non-existent platforms
- Clearer, more accurate policy enforcement definitions improve user understanding

---

## 2026-05-17

**feat: restore alignment column with AI reasons, update How It Works**

Changes:
- Added ALIGNMENT as 4th column in Model Breakdown card grid (110px 150px 110px 160px)
- Each alignment field displays a badge (green ALIGNED / red MISALIGNED) followed by alignment_reason text in italic gray
- Updated breakdown-header-fields grid to match 4-column layout
- Added .alignment-reason CSS class for 10px italic muted styling
- How It Works hero subtitle updated to: "8 independent models analyze every submission simultaneously. Outputs are normalized, scored against platform-specific AI policy alignment, and resolved into a single verdict."
- Context Engine formula simplified to: "Final threshold = Base threshold + Platform adjustment"
- Removed Content Type Modifiers and Strictness Modifiers tables from Context Engine section
- Updated Platform Modifiers table with 9 new entries (Reddit baseline, Discord +0.05, Facebook -0.05, Instagram -0.10, Gaming +0.10, Professional -0.15, Community/Forum +0.05, VR/Metaverse +0.15, Custom user-defined)
- Completely rewrote Policy Alignment Engine section to explain AI-powered batched GPT-4o-mini evaluation with alignment_score, aligned bool, and alignment_reason outputs
- Updated AI Interpretation Layer section to include "AI alignment assessments per model" in the input table

Why:
- Alignment is now a first-class UI component visible alongside category/severity/confidence for each model
- Users can see at a glance which models align with platform policy and why, improving interpretability
- How It Works documentation accurately reflects the simplified Context Engine (platform modifier only) and new AI-powered alignment approach
- Removed documentation of Content Type/Strictness modifiers that no longer apply to analysis

---

## 2026-05-17

**feat: remove content type and strictness, add AI-powered policy alignment**

Changes:
- Removed Content Type and Strictness dropdowns from Analysis Context UI
- Content Type now hardcoded to "Original Post" and Strictness to "Balanced" throughout the application
- Content Type and Strictness still accepted in direct API calls for backwards compatibility, defaulting to above values if not provided
- Replaced keyword-based policy alignment scoring with GPT-4o-mini AI evaluation
- New function `evaluate_alignment_with_ai()` in policy_engine.py makes a single batched GPT call with all model results
- Platform-specific policy instructions provided to GPT including Reddit, Discord, Facebook, Instagram, Gaming, Professional, Forum, VR, and Custom policies
- Each model result now includes `alignment_reason` field (one-sentence plain English explanation of alignment)
- Fallback to existing hardcoded alignment logic if GPT call fails, ensuring analysis completes
- Frontend breakdown cards now display alignment_reason below the model metadata in italic gray text

Why:
- Content Type and Strictness were rarely used and added UI complexity without proportional benefit
- Hardcoding to "Original Post" and "Balanced" covers the majority of use cases
- AI-powered alignment scoring is more nuanced and readable than keyword-based logic, providing human-understandable explanations
- Single batched GPT call is more efficient than per-model evaluation
- Alignment reasons help users understand why a model is or isn't aligned with a platform's policy

---

## 2026-05-17

**feat: merge platform context and policy into single platform selector**

Changes:
- Added PLATFORM_MAP to config.py mapping each platform option (Reddit, Discord, Facebook, Instagram, Gaming Platform, Professional, Community / Forum, VR / Metaverse, Custom) to both a threshold modifier and policy key
- Updated context_engine.py to accept single "platform" parameter and look up modifier from PLATFORM_MAP instead of separate platform_context
- Updated policy_engine.py to accept policy_key from map, handle "generic" policy (no alignment enforcement), and support "custom" policy with user-provided text
- Refactored analyze.py to accept single "platform" field in request payload, look up both threshold_modifier and policy_key from PLATFORM_MAP, and pass correct values to context and policy engines
- Replaced Platform Context and Policy dropdowns in frontend with single Platform dropdown containing all 9 options
- Updated frontend JavaScript to use selectedPlatform variable, STATE_MAP for platform selection, and send single "platform" field in payload
- Custom policy text area now shows only when "Custom" platform is selected

Why:
- Reduces UI complexity by eliminating redundant field selection (users previously selected both a platform context and a policy separately)
- Platform and policy are semantically linked (Reddit/Discord/Facebook/Instagram map to specific policies; Gaming/Professional/Forum/VR use generic policy with threshold adjustments), so merging simplifies UX and prevents mismatched combinations
- Generic platforms (Gaming, Professional, Forum, VR) now correctly apply threshold modifiers without enforcing any specific policy rules, addressing a gap in the previous implementation

---

## 2026-05-17

**fix: full audit remediation -- bugs, dead code, inconsistencies, warnings**

Changes:
- Fixed policy routing end to end: backend now ships Reddit/Discord/Facebook/Instagram rules, the frontend sends the selected policy value correctly, and custom policy text stays isolated to the Custom path
- Corrected threshold modifier direction across config, context documentation, and visible methodology tables so stricter contexts lower thresholds while lenient/high-tolerance contexts raise them
- Standardized error and disabled handling: missing provider credentials now return disabled model rows, error placeholders use `action=\"Error\"` with `flagged=false`, and batch flagged-rate math excludes invalid/error rows
- Brought response contracts back into sync: `/analyze` disagreements now return keyed buckets, insights now expose nested strictest/lenient model objects plus `consensus_recommendation`, `/batch-analyze` now accepts `texts` and returns `{text, analysis}` items, and the frontend reads `ai_analysis` consistently
- Removed dead implementation paths: deleted unused spam/perspective/aws/legacy azure wrappers, removed dead batch-upload JS, removed unused IDs, and pruned stale matrix/table/timeline CSS left from older layouts
- Preserved the topbar model-count contract by deriving `/models` totals from `MODEL_RUNNERS` and keeping the UI pill tied to credential availability instead of per-request success counts

Why:
- The audit surfaced several behavior regressions where the UI, backend, and docs had drifted apart, especially around policy handling, threshold semantics, model availability, and stale code left behind after the 8-model overhaul

Tradeoffs:
- I kept the active 8-model pipeline as the source of truth and removed dormant wrappers instead of reviving the spam path, which reduced ambiguity and let the docs/UI/code converge on a single supported model set

## 2026-05-17 (Part 4)

**fix: scope disagreement banner to Summary tab only**

Changes:
- Moved `#disagreement-banner` from between `#batch-summary` and `#results-empty` into `#lower-panel-summary` as first child
- Banner now only appears on the Summary tab, not floating above all tabs

**fix: remove duplicate OpenAI Moderation card from Models tab**

Changes:
- Removed duplicate `<article class="model-detail-card dim-blue">` OpenAI Moderation card from the Open Source Models section in `#models-panel`
- OpenAI Moderation now appears only once (in Enterprise APIs section)

**feat: add GET /models endpoint + dynamic topbar model count**

Changes:
- Created `backend/routes/models.py` with `GET /models` endpoint
- Returns `{"active_count": N, "total_count": 8}` based on credential-presence check only (no inference calls)
- Registered `models_bp` blueprint in `backend/app.py`
- Added IIFE in `frontend/app.js` to fetch `/models` on page load and update `#models-active-count` text
- Fallback static text "8 Models Available" shown if fetch fails

**fix: resolve GPU compositing blank render bug on model cards**

Changes:
- Removed `will-change: opacity` from `.live-indicator` in `style.css`
- Removed `backdrop-filter: blur(8px)` from `.model-detail-card` in `style.css`
- Root cause: `backdrop-filter` + `will-change` on a nested element promoted to a new compositing layer, causing text to not paint on first display of the panel

**style: reduce excessive top spacing in Models tab hero**

Changes:
- Added `#models-panel` inline style: `padding: 0 48px 48px` (was `padding: 48px`)
- Added scoped rule `#models-panel .methodology-hero { margin-bottom: 0; }` to prevent double spacing

**fix: correct "Five independent AI models" copy to "Eight" in Models tab hero**

Changes:
- Updated hero subtitle: "Five" → "Eight" in `#models-panel` hero section

**style: redesign Model Breakdown tab with card-per-row layout**

Changes:
- Replaced two-table decision matrix with card-per-row layout
- New `renderBreakdownCard(result)` function in `app.js` renders one card per model
- Each card shows: model name + meta + arch chip (left), category + severity bar + confidence (middle grid), action button (right)
- Section header rows with CATEGORY, SEVERITY, CONFIDENCE, ACTION column labels injected once per section
- Removed ALIGNMENT column entirely
- CSS classes added: `.breakdown-card`, `.breakdown-model-info`, `.breakdown-fields`, `.breakdown-field-value`, `.breakdown-confidence`, `.breakdown-action-btn`, `.breakdown-arch-chip`, `.breakdown-header-row`, `.breakdown-header-spacer`, `.breakdown-header-fields`, `.severity-bar-wrap`, `.severity-bar-number`, `.severity-bar-track`, `.severity-bar-fill`
- Action left border variants: `.aligned-allow`, `.aligned-remove`, `.aligned-review`
- Action button color variants: `.action-allow`, `.action-remove`, `.action-review`
- Confidence displayed to 2 decimal places (`toFixed(2)`)

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
