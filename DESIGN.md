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
| Azure Content Safety | `.dim-blue` | #0078d4 |
| AWS Comprehend | `.dim-amber` | #ff9900 |
| Google NLP | `.dim-blue` | #4285f4 |
| Toxicity Classifier | `.dim-red` | `--red` / `--red-light` |
| Offensive Language Detector | `.dim-amber` | `--amber` / `--amber-light` |
| Hate Speech Detector | `.dim-red` | `--red` / `--red-light` |
| Spam Detector | `.dim-blue` | `--accent` / `--accent-light` |
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
- Navigation status pill (dynamic model count, e.g. "7 Models Active")
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
- Model Breakdown: decision matrix table directly (no accordion wrapper)
- Insights: insight cards + AI summary card
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

### Insights Bento Grid (.insights-bento)
- CSS Grid layout with 12 columns and 16px gap
- Houses both strictest/lenient insight cards and AI analysis insight cards
- Responsive: collapses to 1 column on mobile (max-width: 900px) with 12px gap
- Margin-bottom: 32px

### Insight Card New (.insight-card-new)
- Grid: spans 6 columns in bento layout
- `--surface2` background (rgba(17,17,20,0.88)), blur(8px) backdrop-filter
- Border: 1px `--border`, border-radius 10px, 24px padding
- Used for: Strictest Model and Most Lenient Model cards
- Animations: fade-up 200ms with staggered 50ms delay
- Hover: border-color becomes `--border-strong`, transforms -2px Y, box-shadow increases

### AI Insight Card New (.ai-insight-card-new)
- Grid: spans 4 columns by default in bento layout
- `--surface2` background, `--border` border, border-radius 10px, 20px padding
- Used for: Why Models Disagreed, Risk Narrative, Context Sensitivity, Most Contested Category cards
- Animations: fade-up 200ms with staggered 50-100ms+ delay
- Hover: border-color becomes `--border-strong`
- Variants:
  - `.ai-insight-card-new--wide`: spans 8 columns (Context Sensitivity card)
  - `.ai-insight-card-new--accent`: spans 4 columns with `--accent-light` background and `--accent` border (Most Contested Category card)
- Category text: DM Serif Display 32px bold `--text` (updated from JetBrains Mono 18px)
- Label text: JetBrains Mono 10px uppercase `--accent`
- Body text: 13px `--text-secondary`, line-height 1.6

### Decision Matrix Table
- Rendered as two fully separate tables with individual section labels and column headers
- Section 1: "ENTERPRISE APIS" — Perspective API, Azure Content Safety, AWS Comprehend, Google NLP, OpenAI Moderation
- Section 2: "OPEN SOURCE MODELS" — Toxicity Classifier, Offensive Language Detector, Hate Speech Detector, Spam Detector, Bias Detector
- Section label (.matrix-section-label): JetBrains Mono 10px uppercase, var(--muted), padding 20px 0 10px 0
- Divider (.matrix-section-divider): 1px var(--border-strong), margin 8px 0 between sections
- Each table has its own full column header row
- Column headers: 11px uppercase var(--muted) JetBrains Mono, var(--border-strong) bottom border
- No vertical borders anywhere
- Horizontal dividers only: 1px var(--border) between rows
- Row fade-up animation resets index to 0 at start of each table (staggered 50ms per row)
- Disabled models (.matrix-row-disabled):
  - Entire row opacity: 0.4
  - MODEL cell: model name in var(--muted)
  - Remaining columns: single colspan "Coming Soon" cell in JetBrains Mono 11px italic var(--muted)

### Disagreement Banner (.disagreement-banner)
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
- Generated by GPT-4o-mini from all active model results (up to 9 models)
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

### Skeleton Loading
- Table shows up to 9 skeleton rows (matching configured models) while models run
- Shimmer: left-to-right highlight sweep (shimmer keyframe, 1.4s linear infinite)
- Base: `--surface2`, highlight: rgba(255,255,255,0.06)
- Replaced with real results on completion (200ms fade-in)

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

### Insights Bento Grid (.insights-bento)
- CSS Grid layout: 12 columns, 16px gap
- Max-width inherited from parent panel
- Responsive: collapses to 1 column on mobile (max-width: 900px) with 12px gap
- Margin-bottom: 32px
- Houses both model insight cards and AI analysis insight cards

### Insight Card New (.insight-card-new)
- Grid: spans 6 columns in bento layout (3 columns on mobile)
- `--surface2` background (rgba(17,17,20,0.88)), blur(8px) backdrop-filter
- Border: 1px `--border`, border-radius 10px, 24px padding
- Used for: Strictest Model and Most Lenient Model cards
- Animations: fade-up 200ms with staggered 50ms delay
- Hover: border-color becomes `--border-strong`, transform -2px Y, box-shadow increases
- Left border: 3px colored by action (red/amber/green)

### Insight Card New Label (.insight-card-new-label)
- JetBrains Mono 10px uppercase `--accent`
- Eyebrow above value
- Margin-bottom: 8px

### Insight Card New Value (.insight-card-new-value, .insight-card-new-desc)
- `.insight-card-new-value`: DM Serif Display 32px bold `--text` for model name or value
- `.insight-card-new-desc`: 13px `--text-secondary` for description text, line-height 1.6

### AI Insight Card New (.ai-insight-card-new, .ai-insight-card-new--wide, .ai-insight-card-new--accent)
- Grid: spans 4 columns by default in bento layout
- `--surface2` background, `--border` border, border-radius 10px, 20px padding
- Used for: Why Models Disagreed, Risk Narrative, Context Sensitivity, Most Contested Category cards
- Animations: fade-up 200ms with staggered 50-100ms+ delay
- Hover: border-color becomes `--border-strong`
- Variants:
  - `.ai-insight-card-new--wide`: spans 8 columns (Context Sensitivity card)
  - `.ai-insight-card-new--accent`: spans 4 columns with `--accent-light` background and `--accent` border (Most Contested Category card)
- Category text: DM Serif Display 32px bold `--text`
- Label text: JetBrains Mono 10px uppercase `--accent`
- Body text: 13px `--text-secondary`, line-height 1.6

### AI Insight Card Header (.ai-insight-card-new-header, .ai-insight-icon)
- `.ai-insight-card-new-header`: flex row with icon and title
- `.ai-insight-icon`: 24px icon element, margin-right 12px
- Title: JetBrains Mono 10px uppercase `--accent`
- Margin-bottom: 16px

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
