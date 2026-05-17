# ModEval — Design System Documentation

**Theme:** Atmospheric Dark — Premium enterprise UI inspired by Vercel, Stripe, and OpenAI

---

## Design Philosophy

ModEval is a data-first tool built for Trust & Safety professionals and AI governance stakeholders. The design prioritizes clarity, authority, and analytical precision over decoration. Every visual decision serves the data.

The aesthetic direction is **Sophisticated Utility** — dark, high-contrast, and information-dense without feeling cluttered. The interface should feel like it was built by a serious company, not a side project.

Key principles:
- Data is the hero. UI chrome is minimal.
- Color carries meaning. Every color maps to a specific semantic state.
- Typography signals hierarchy. Three distinct typefaces each serve a specific role.
- Motion is purposeful. Animations communicate state changes, not decoration.

---

## Color Palette

All colors are defined as CSS variables in `:root`.

### Base Colors

| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#00030a` | Page background — deepest layer |
| `--surface` | `rgba(10, 15, 30, 0.6)` | Primary card and panel surfaces |
| `--surface2` | `rgba(15, 20, 45, 0.7)` | Secondary surfaces, dropdown panels, modal |
| `--surface3` | `rgba(20, 30, 60, 0.8)` | Tertiary surfaces, hover states |
| `--border` | `rgba(150, 200, 255, 0.08)` | Default borders — very subtle blue tint |
| `--border-strong` | `rgba(150, 200, 255, 0.15)` | Emphasized borders, table headers |
| `--white` | `#ffffff` | Pure white for high-contrast elements |

### Text Colors

| Variable | Value | Usage |
|---|---|---|
| `--text` | `#fdfcff` | Primary text — near white with warm tint |
| `--text-secondary` | `#94a3b8` | Secondary text, descriptions, subtitles |
| `--muted` | `#64748b` | Muted labels, eyebrows, placeholders |

### Accent Colors

| Variable | Value | Usage |
|---|---|---|
| `--accent` | `#3b82f6` | Primary interactive color — buttons, active states, links |
| `--accent-light` | `rgba(59, 130, 246, 0.15)` | Accent backgrounds — selected states |
| `--accent-glow` | `rgba(59, 130, 246, 0.4)` | Glow effects on accent elements |

### Semantic Status Colors

Each status color has a solid variant and a light (background) variant.

| State | Solid | Light | Usage |
|---|---|---|---|
| Allow / Safe | `--green` #10b981 | `--green-light` rgba(16,185,129,0.15) | Allow actions, aligned badges, safe content |
| Review / Warning | `--amber` #f59e0b | `--amber-light` rgba(245,158,11,0.15) | Review actions, warnings, disagreement banners |
| Remove / Danger | `--red` #ef4444 | `--red-light` rgba(239,68,68,0.15) | Remove actions, misaligned badges, violations |
| Bias / Special | `--purple` #8b5cf6 | `--purple-light` rgba(139,92,246,0.15) | Bias dimension, special indicators |

### Model Dimension Colors

Each model has an associated color used for card left borders and row accents:

| Model | Color Class | Maps To |
|---|---|---|
| Hive Moderation | `.dim-blue` | #3b82f6 |
| Azure Content Safety | `.dim-blue` | `--accent` |
| Google NLP | `.dim-blue` | `--accent` |
| Toxicity Classifier | `.dim-red` | `--red` / `--red-light` |
| Offensive Language Detector | `.dim-amber` | `--amber` / `--amber-light` |
| Hate Speech Detector | `.dim-red` | `--red` / `--red-light` |
| Bias Detector | `.dim-purple` | `--purple` / `--purple-light` |

---

## Typography

Three typefaces are imported from Google Fonts. Each serves a specific purpose and must not be used interchangeably.

### DM Serif Display
**Role:** Authority and editorial weight

Used exclusively for:
- Tab section headings (How It Works, Models)
- The threshold formula hero element
- The editorial disagreement quote
- Model card titles in the Models tab

Never use for body text, labels, or data values.

### Inter
**Role:** Readable body text and UI labels

Used for:
- Base body font (entire page default)
- Brand wordmark (.brand-wordmark)
- Hero title and subtitle in input panel
- Results panel headings
- Consensus card values
- All general paragraph text

Letter-spacing: `-0.035em` on headings for tight, modern feel.
Weights used: 400 (body), 500 (labels), 600 (headings and emphasis).

### JetBrains Mono
**Role:** Technical precision and data

Used for:
- Navigation status pill (dynamic model count, e.g. "7 Models Available")
- Example category pill buttons
- All badge and chip elements
- Model architecture chips (BERT, RoBERTa, etc.)
- Flow diagram arrows in architecture section
- Code blocks in How It Works
- Methodology data tables
- Modal overlay headings
- HuggingFace model links

Never use for general reading text. Monospace signals "this is technical data."

---

## Layout

### Page Structure

```
.app-shell (max-width: 1280px, centered)
├── .topbar (fixed height, --surface background)
│   ├── .brand-wordmark (left)
│   ├── .topbar-nav (center) — ANALYSIS, BENCHMARK, 
│   │   HOW IT WORKS, MODELS
│   └── .topbar-status (right)
├── .workspace (CSS Grid: 38% / 62%) — Analysis mode
│   ├── .input-panel (left)
│   └── .results-panel (right)
├── #benchmark-panel — Benchmark mode (hidden by default)
├── #how-it-works-panel — How It Works (hidden by default)
└── #models-panel — Models (hidden by default)
```

### Panel Split
- Left panel (input): 38% width
- Right panel (results): 62% width
- Separated by 1px `--border` vertical line
- Both panels have `.panel-inner` with consistent 48px padding

### Responsive
- Below 900px: single column, input panel stacks above results panel
- Padding reduces to 20px on mobile
- Example pills wrap naturally

---

## Component Specifications

### Navigation Bar (.topbar)
- Height: 72px
- Background: `--surface`
- Bottom border: 1px `--border`
- Backdrop blur: `blur(12px)`
- No box-shadow
- Brand wordmark: "Mod" in `--text`, "Eval" in `--accent`
- Includes .topbar-nav with four items: ANALYSIS (active state), BENCHMARK (locked), HOW IT WORKS, MODELS -- clicking each shows its respective panel and hides all others

### Status Pill (.topbar-status)
- Font: JetBrains Mono 11px
- Background: `--surface2`
- Border: 1px `--border`
- Green pulsing dot: animated with `pulse-dot` keyframe

### Example Category Pills (.example-pill)
- Font: JetBrains Mono 11px
- Default: `--surface2` background, `--border` border, `--text-secondary` text
- Hover: category-specific `--x-light` background, matching border and text color
- Border-radius: pill shape

### Custom Select Dropdowns (.custom-select)
- Trigger: 40px height, `--surface2` background, `--border` border, chevron right
- Opens as modal overlay (not inline dropdown)
- Modal panel: `--surface2` background, backdrop-filter blur(12px), box-shadow 0 8px 32px rgba(0,0,0,0.5)
- Option name: 13px Inter font-weight 600 `--text`
- Option description: 11px `--text-secondary` italic
- Selected state: `--accent-light` background, 2px `--accent` left border
- Animation: scales from trigger button position to center (modal-open keyframe)

### Primary Button (.primary-button)
- Height: 40px, full width
- Background: `--accent` blue gradient
- Text: JetBrains Mono 12px uppercase, font-weight 600, letter-spacing 0.08em
- Border-radius: 6px
- Loading state: shimmer animation overlay + "Analyzing..." text

### Topbar Navigation (.topbar-nav)
- Four items: ANALYSIS, BENCHMARK [locked], HOW IT WORKS, MODELS
- Font: JetBrains Mono 11px uppercase
- Active item: var(--text) color, 1.5px var(--accent) bottom border
- Locked item: var(--muted), opacity 0.5, cursor default
- Clicking switches between .workspace and the respective full-page panel

### Lower Tab Strip (.results-lower-tabs)
- Appears only after analysis results load
- Hidden by default, shown when results render
- Three tabs: Summary, Model Breakdown, Insights
- Font: JetBrains Mono 11px uppercase
- Active tab: var(--text), 2px var(--accent) bottom border
- Inactive tab: var(--muted)
- Border-bottom: 1px var(--border)

### Lower Panels (.lower-panel)
- Summary: consensus hero + donut chart + severity gauge + action legend
- Model Breakdown: breakdown cards grouped into Enterprise APIs and Open Source Models with one shared header row per section; columns: CATEGORY, SEVERITY, CONFIDENCE, ACTION (no ALIGNMENT column)
- Insights: insight cards + structured AI analysis cards + ALIGNMENT ASSESSMENT section
- Hidden/shown by lower tab clicks
- All start hidden, Summary shown by default when results load

### Action Badges (.badge)
- Font: JetBrains Mono 11px uppercase font-weight 600
- Border-radius: 4px
- Remove: `--red-light` background, `--red` text
- Review: `--amber-light` background, `--amber` text
- Allow: `--green-light` background, `--green` text
- Aligned: `--green-light` background, `--green` text
- Misaligned: `--red-light` background, `--red` text

### Severity Indicators (.severity-value)
- Circular element with number
- Low (1-3): `--green` glow
- Medium (4-7): `--amber` glow
- High (8-10): `--red` glow
- Glow implemented via box-shadow

### Insight Cards (.insight-card)
- Three equal cards side by side
- `--surface2` background, `--border` border, border-radius 10px, 20px padding
- Left border 3px colored by action: `--red` Remove, `--amber` Review, `--green` Allow
- Eyebrow label: 10px uppercase `--muted` JetBrains Mono
- Explainer: 11px italic `--muted`
- Value: DM Serif Display or Inter 600 depending on content

### Model Breakdown Card Layout (.breakdown-card)
- Rendered as two sections (ENTERPRISE APIS, OPEN SOURCE MODELS), each with a shared column header row
- Section header row (`.breakdown-header-row`): flex row, `padding: 0 24px 10px 24px`, `margin-bottom: 8px`, `border-bottom: 1px var(--border-strong)`
  - `.breakdown-header-spacer`: `width: 140px; flex-shrink: 0` — aligns with model info column
  - `.breakdown-header-fields`: CSS grid `110px 150px 110px auto`, `font-size: 10px`, `color: var(--text-secondary)`, JetBrains Mono uppercase — columns: CATEGORY, SEVERITY, CONFIDENCE, ACTION
- Each card (`.breakdown-card`): flex row, `flex-wrap: nowrap`, `box-sizing: border-box`, `gap: 24px`, `padding: 16px 24px`, `border-radius: 8px`, `--surface2` background, `overflow: visible`
- Action left border variants: `.aligned-allow` (3px `--green`), `.aligned-remove` (3px `--red`), `.aligned-review` (3px `--amber`)
- `.breakdown-model-info`: `width: 140px; flex-shrink: 0` — model name, meta subtitle, arch chip
  - `.breakdown-model-name`: 13px Inter 600 `--text`
  - `.breakdown-model-meta`: 11px `--text-secondary`
  - `.breakdown-arch-chip`: JetBrains Mono 10px chip badge
- `.breakdown-fields`: CSS grid `110px 150px 110px`, `align-items: center`, `gap: 16px`
  - Column 1 (`.breakdown-field-value`): category name, 12px `--text`
  - Column 2 (`.severity-bar-wrap`): severity number + bar track + fill (`.severity-bar-fill.low/mid/high`)
  - Column 3 (`.breakdown-confidence`): confidence to 2 decimal places, JetBrains Mono 12px
- `.breakdown-action-btn`: `flex-shrink: 0; min-width: 76px; max-width: 76px`, pill button, JetBrains Mono 11px uppercase
  - `.action-allow`: `--green-light` bg, `--green` text/border
  - `.action-review`: `--amber-light` bg, `--amber` text/border
  - `.action-remove`: `--red-light` bg, `--red` text/border
- Disabled cards: `opacity: 0.4`, action area replaced with "Coming Soon" italic span
- No ALIGNMENT column (alignment verdicts consolidated in Insights tab ALIGNMENT ASSESSMENT section)

### Disagreement Banner (.disagreement-banner)
- Scoped to the Summary tab only — first child of `#lower-panel-summary`
- Background: `--white`
- Text: `#050505` (near black for maximum contrast)
- Warning icon: `--amber`
- Border-radius: 8px, generous 16px padding
- Slides in from top on appearance (200ms ease)

### Consensus Summary (.consensus-summary)
- Spans full grid width (grid-column: 1 / -1)
- Background: rgba(255,255,255,0.03)
- Left border: 3px `--accent`
- Border-radius: 8px, 14px 16px padding
- Font: 13px Inter, line-height 1.7, `--text` color
- Generated by Claude Haiku (claude-haiku-4-5-20251001) from all active model results (up to 8 models)
- Falls back to JS-generated consensus summary if AI call fails
- Replaces per-card explainability cards — single unified interpretation

### Consensus Hero (.consensus-hero)
- Sits above the results breakdown and below the disagreement banner
- Background: `--surface2`, left border color mapped to action state
- Eyebrow uses JetBrains Mono 10px uppercase
- Primary decision uses DM Serif Display at 64px
- Subtitle shows the first two sentences of the AI summary for quick scanability

### Verdict Visuals Row (.verdict-visuals-row)
- Two-column grid inside .consensus-hero
- Column 1: SVG donut chart (120px) showing model vote distribution -- segments colored by action
- Column 2: SVG semicircle arc gauge (140x80px) showing average severity 1-10
- Both populated by JS after results load
- Colored green/amber/red by action/severity range

### Verdict Action Legend (.verdict-action-legend)
- Row of three items below the visuals row
- REMOVE (red dot), REVIEW (amber dot), ALLOW (green dot)
- Font: JetBrains Mono 10px uppercase var(--muted)
- Dot: 8px circle colored by action

### Benchmark Placeholder
- Lives outside `.workspace` and is toggled from the topbar nav
- Uses a blurred skeleton leaderboard with a locked overlay card to signal work-in-progress status
- Includes three low-emphasis preview cards for planned v2 capabilities

### Model Cards (.model-detail-card)
- 2-column grid, last card centered if odd
- Left border 3px colored by model dimension
- DM Serif Display for model name
- JetBrains Mono for architecture badge
- `--text-secondary` for body text
- No `backdrop-filter` or `will-change` — both removed to fix GPU compositing blank-render bug on first panel display

### Skeleton Loading
- Table shows up to 8 skeleton rows (matching configured models) while models run
- Shimmer: left-to-right highlight sweep (shimmer keyframe, 1.4s linear infinite)
- Base: `--surface2`, highlight: rgba(255,255,255,0.06)
- Replaced with real results on completion (200ms fade-in)

### Platform Policy Box (.platform-policy-box)
- Lives below the Platform selector dropdown in the input panel
- `--surface2` background, `--border` border, border-radius 8px, 16px padding
- Header: JetBrains Mono 10px uppercase `--muted` — "PLATFORM POLICY: [PLATFORM NAME]"
- Body: 12px `--text-secondary`, line-height 1.6, lists sourced policy rules for selected platform
- Updates dynamically when platform selection changes
- For Custom platform: shows placeholder text explaining user should provide policy text
- Sourced from official platform guidelines (Reddit, Discord, Facebook, Instagram)

### Context Explainer (.context-explainer, .context-explainer-wrapper, .context-info-icon)
- Hover tooltip triggered by an SVG info icon (ⓘ) positioned next to the PLATFORM label
- `.context-explainer-wrapper`: relative-positioned container holding both the icon and the tooltip
- `.context-info-icon`: 16px SVG circle-i icon, color `--muted` by default, transitions to `--accent` on hover, cursor pointer
- `.context-explainer`: absolute-positioned tooltip, `display:none` by default, revealed on `.context-explainer-wrapper:hover`; 12px `--text-secondary`, line-height 1.6, backdrop blur, appears above the icon
- Content: plain text explaining why platform selection exists and how it affects the interpretation layer; no clickable link inside

### Alignment Assessment Section (.alignment-assessment-container)
- Lives in the Insights tab as part of the bento grid layout
- Full-width card spanning all 12 columns
- `--surface2` background, `--border` border, border-radius 10px, 24px padding
- Header: JetBrains Mono 10px uppercase `--accent` — "ALIGNMENT ASSESSMENT"
- Body: table/grid of model alignment verdicts, each row shows:
  - Model name (Inter 13px 600 `--text`)
  - Verdict badge: ALIGNED (`--green-light` bg, `--green` text) or MISALIGNED (`--red-light` bg, `--red` text)
  - Alignment reason (12px `--text-secondary`, italic)
- Footer: 11px `--muted` JetBrains Mono — "Alignment assessed by Claude Haiku against [platform] content policy."
- Fade-up animation with staggered timing matching other insight cards

---

## Animation Reference

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| `pulse-dot` | 1.8s infinite | ease-in-out | Status dot in topbar |
| `shimmer` | 1.2-1.4s infinite | linear | Loading button + skeleton rows |
| `fade-in` | 200ms | ease | Example textarea fill, results reveal |
| `fade-up` | 200ms | ease | Table rows on results load (staggered) |
| `modal-open` | 200ms | ease | Modal panel appears from trigger position |
| `modal-close` | 150ms | ease | Modal panel dismisses |

**Global transition default:** `150ms ease` on all interactive elements.

---

## Methodology Tab Specifics

### Formula Hero
- DM Serif Display, large centered text
- Borderless box, acts as visual centerpiece of Context Engine section

### Modifier Tables
- Negative values (e.g. -0.10): `.modifier-negative` — soft muted emerald
- Positive values (e.g. +0.15): `.modifier-positive` — soft muted amber
- Reinforces that negative = more tolerant (green), positive = stricter (amber)

### Code Blocks (.methodology-code)
- Background: `#020202` (darker than surrounding card)
- Dracula-inspired syntax highlighting:
  - Keys: `.code-key` — pink (#FF79C6)
  - Strings: `.code-string` — yellow (#F1FA8C)
  - Types: `.code-type` — cyan (#8BE9FD)
  - Comments: `.code-comment` — muted purple (#6272A4)
  - Punctuation: `.code-punctuation` — default text

### Code Window (.code-window)
- Wrapper component for code blocks with macOS-style chrome
- Border: `--border-strong`, border-radius 8px
- Background: `--surface2`, shadow 0 8px 32px rgba(0,0,0,0.4)
- Contains header with dots (red/amber/green) and filename
- Header has background rgba(0,0,0,0.3) and border-bottom `--border`
- Filename: JetBrains Mono 11px, `--text-secondary`, letter-spacing 0.05em

### Code Window Dots (.code-window-dots, .code-dot)
- Three 12px circles in header (red, amber, green)
- Colors: #ef4444 (red), #f59e0b (amber), #10b981 (green)
- Mimics macOS window controls
- Gap: 8px between dots

### Integrity Card List (.integrity-card-list)
- Unstyled list (no bullets) with green checkmark bullets
- Flex column layout, 12px gap between items
- List items: 14px `--text-secondary`, line-height 1.5
- Checkmark (✓): `--green`, bold, positioned 24px left
- Used in methodology sections for feature/step lists

### Architecture Flow Component (.arch-flow-visual, .arch-flow-step, .arch-flow-icon, .arch-flow-connector, .arch-flow-label)
- `.arch-flow-visual`: container for entire architecture diagram
- `.arch-flow-step`: individual node/stage in flow (inline-flex, gap 12px)
- `.arch-flow-icon`: circular icon container (60px, centered SVG icon, `--surface2` background, `--accent` border)
- `.arch-flow-connector`: SVG arrow/line connecting consecutive steps
- `.arch-flow-label`: JetBrains Mono 11px `--text-secondary` label below/beside step
- Used in How It Works Section 1 to show: Input → Normalize → Score → Align → Decide pipeline
- All text in DM Serif Display for authority, icons in monospace for technical precision

### Architecture Flow Strip (.arch-flow-strip, .arch-title-block)
- `.arch-flow-strip`: flex row of architecture flow steps with SVG connectors between them
- `.arch-title-block`: section heading and hero area above flow, contains "STAGE XX" label and section title
- Grid-based layout for hero area with typography hierarchy
- Used as intro to How It Works methodology sections

### Pull Quote Block (.pull-quote-block, .pull-quote-mark, .pull-quote-text, .pull-quote-attribution)
- `.pull-quote-block`: container with `--accent` left border (2px), padding-left 20px, italic styling
- `.pull-quote-mark`: opening quotation mark mark or visual indicator (DM Serif Display)
- `.pull-quote-text`: 18px DM Serif Display, `--text`, italic, line-height 1.8
- `.pull-quote-attribution`: 13px `--text-secondary` JetBrains Mono, margin-top 12px
- Used for editorial emphasis: "Disagreements are not errors — they are the most analytically interesting output ModEval produces."

### Equation Block (.equation-block, .equation-label, .equation-display, .equation-score, .equation-op, .equation-var, .equation-sigma)
- `.equation-block`: centered container with generous padding (32px), rendered as mathematical formula
- `.equation-label`: small JetBrains Mono 10px uppercase `--muted` label above equation
- `.equation-display`: flex row containing equation components
- `.equation-score`: threshold value or score (JetBrains Mono 14px bold)
- `.equation-op`: mathematical operator (+, −, =, etc.) (JetBrains Mono 14px `--text-secondary`)
- `.equation-var`: variable name (DM Serif Display 16px)
- `.equation-sigma`: sigma symbol or summation notation (JetBrains Mono 18px)
- Color-coded: modifiers in amber/green, thresholds in accent blue
- Used in How It Works Context Engine section to display: threshold_adj = clamp(base + platform_mod + content_mod + strictness_mod, 0.10, 0.90)

### Methodology Two-Column Layout (.methodology-two-col)
- Flex row layout with 50/50 split or flexible columns
- Gap: 32px between columns
- Left column: text content (paragraphs, lists)
- Right column: visual element (code window, equation block, etc.)
- Responsive: stacks to single column below 900px
- Used extensively in How It Works sections

### Code Window (.code-window, .code-window-header, .code-window-dots, .code-dot, .code-window-filename)
- `.code-window`: bordered container with macOS-style chrome
- Border: `--border-strong`, border-radius 8px, background `--surface2`
- Box-shadow: 0 8px 32px rgba(0,0,0,0.4)
- `.code-window-header`: flex row at top, background rgba(0,0,0,0.3), border-bottom `--border`
- Padding: 12px 16px
- `.code-window-dots`: flex row of three control dots (red, amber, green)
- `.code-dot`: individual 12px circles with three variants: `.dot-red` #ef4444, `.dot-amber` #f59e0b, `.dot-green` #10b981
- Gap between dots: 8px
- `.code-window-filename`: JetBrains Mono 11px `--text-secondary`, margin-left auto, letter-spacing 0.05em
- Inside: normalized output schema or code snippet rendered as monospace text
- Used in How It Works Section 2 to display unified output format

### Insights Tab Redesign Components

#### Insights Top Grid (.insights-grid)
- CSS Grid: `1fr 2fr` (left tall card + right cluster), gap 20px, margin-bottom 28px
- Left column: Strictest Model tall card (`.insights-card-tall`)
- Right column: `.insights-grid-right` — 2-column grid containing Most Lenient (full width via `.insights-card-wide`), Disagreement Vector, Risk Narrative

#### Insights Card (.insights-card, .insights-card-tall, .insights-card-wide)
- Base: `var(--surface2)` background, `var(--border)` border, border-radius 12px, padding 28px
- Hover: border-color `var(--border-strong)`, `translateY(-2px)`
- `.insights-card-tall`: min-height 320px, flex column, `justify-content: space-between`
- `.insights-card-wide`: `grid-column: 1 / -1` (spans full right column)
- Eyebrow (`.insights-card-eyebrow`): JetBrains Mono 9px uppercase; color variants: default `--accent`, `.lenient` green, `.disagreement` `--text-secondary`, `.risk` red
- Body text (`.insights-card-body`): Inter 13px, line-height 1.7
- Inline colored words (`.insights-card-body-highlight`): `.allow` green, `.review` amber, `.remove` red, `.violation` red

#### Insights Alignment Matrix (.insights-matrix)
- Container: `var(--surface)` background, `var(--border)` border, border-radius 12px, overflow hidden
- Header row (`.insights-matrix-header`): 3-column grid (`2fr 1fr 4fr`), JetBrains Mono 9px uppercase `--muted`
- Rows (`.insights-matrix-row`): 3-column grid, `20px 24px` padding; hover: `var(--surface2)` background
- `.misaligned-row`: subtle red tint background
- Model name (`.insights-matrix-model`): Inter 14px 600
- Reason (`.insights-matrix-reason`): Inter 12px italic `--text-secondary`, padding-left 16px, `border-left: var(--border)`
- Footer (`.insights-matrix-footer`): JetBrains Mono 10px italic `--muted`, centered

#### Insights AI Executive Summary (.insights-ai-section)
- Gradient border via `::before` pseudo-element (`linear-gradient` teal to red tint)
- Background: `var(--surface2)`, border-radius 16px, padding 40px
- Header (`.insights-ai-header`): flex, space-between
  - Left: 🧠 icon in accent-tinted box + label + title
  - Right: consensus badge colored by action
- Body (`.insights-ai-body`): `2fr 1fr` grid
  - Finding card (`.insights-ai-finding`): dark background, absolute tag (Critical Finding / Safe / Grey Area), left border colored by violation type
  - Signal card (`.insights-ai-signal`): confidence bar with gradient fill (amber to red)

### Editorial Quote
- DM Serif Display, larger font
- `--accent` left border 2px, padding-left 20px
- Italic styling
- Used for: "Disagreements are not errors — they are the most analytically interesting output ModEval produces."

---

## Do's and Don'ts

**Do:**
- Use JetBrains Mono for all numbers, codes, and technical identifiers
- Use semantic color variables never hardcoded hex values in new components
- Keep animations under 200ms -- this is a data tool not a marketing page
- Use `--border` (subtle) for most borders, `--border-strong` only for emphasis
- Match left border color to action/dimension when adding new cards

**Don't:**
- Use DM Serif Display for body text or labels
- Add decorative elements that don't serve a functional purpose
- Use pure black (#000000) -- use `--bg` (#00030a) instead
- Mix border styles -- horizontal lines only in tables, no vertical dividers
- Add new color values outside the defined palette

---

## Adding New Components

When adding a new component, follow this checklist:

1. Use CSS variables only -- no hardcoded colors or sizes
2. Font choice: Inter for reading, JetBrains Mono for data, DM Serif Display for headings only
3. Borders: `--border` default, `--border-strong` for emphasis
4. Interactive states: 150ms ease transition on all hover/focus/active states
5. If the component shows a status (allow/review/remove/aligned/misaligned) use the existing `.badge` classes
6. If the component is a card, use `--surface2` background with `--border` border and border-radius 10px
7. Match left border color to semantic meaning using the existing dimension color classes

