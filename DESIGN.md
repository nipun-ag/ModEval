# ModEval — Design System Documentation

**Version:** Current (April 2026)
**Theme:** Atmospheric Dark — Premium enterprise UI inspired by Vercel, Stripe, and OpenAI
**Maintained by:** Nipun Aggarwal

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
- Navigation status pill ("5 Models Active")
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
├── .topbar (fixed height, --surface background, 1px --border bottom)
│   ├── .brand-wordmark (left)
│   └── .topbar-status (right)
└── .workspace (CSS Grid: 38% / 62%)
    ├── .input-panel (left)
    └── .results-panel (right)
```

### Panel Split
- Left panel (input): 38% width
- Right panel (results): 62% width
- Separated by 1px `--border` vertical line
- Both panels have `.panel-inner` with consistent 32px padding

### Responsive
- Below 900px: single column, input panel stacks above results panel
- Padding reduces to 20px on mobile
- Example pills wrap naturally

---

## Component Specifications

### Navigation Bar (.topbar)
- Height: 56px
- Background: `--surface`
- Bottom border: 1px `--border`
- No box-shadow
- Brand wordmark: "Mod" in `--text`, "Eval" in `--accent`

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

### Tab Navigation (.results-tabs)
- Container: pill-shaped with glassmorphism (rgba(255,255,255,0.03), backdrop-filter blur(8px))
- Active tab: `--white` text, 1.5px `--accent` underline spanning text width only
- Inactive tab: `#666666` text, hover `#999999`
- Tab switch transition: 150ms fade + 5px upward slide (translateY)

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

### Decision Matrix Table
- No vertical borders anywhere
- Horizontal dividers only: 1px `--border` between rows
- Column headers: 11px uppercase `--muted` JetBrains Mono, `--border-strong` bottom border
- Row fade-in: staggered 50ms delay per row (fade-up keyframe)

### Disagreement Banner (.disagreement-banner)
- Background: `--white`
- Text: `#050505` (near black for maximum contrast)
- Warning icon: `--amber`
- Border-radius: 8px, generous 16px padding
- Slides in from top on appearance (200ms ease)

### Explainability Cards (.explanation-card)
- 2-column grid on desktop
- `--surface2` background, 1px `--border` border, border-radius 10px, 18px padding
- Subtle glassmorphism: backdrop-filter blur(8px), border rgba(255,255,255,0.06)
- Card header: model name 13px font-weight 600 left, action badge right

### Model Cards (.model-detail-card)
- 2-column grid, last card centered if odd
- Left border 3px colored by model dimension
- DM Serif Display for model name
- JetBrains Mono for architecture badge
- `--text-secondary` for body text

### Skeleton Loading
- Table shows 5 skeleton rows while models run
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
