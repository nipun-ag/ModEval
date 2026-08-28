# ModEval — Context & Policy-Aware AI Moderation Evaluation System

**Live:** [modeval.bynipun.com](https://modeval.bynipun.com) &nbsp;|&nbsp; **Built by:** [Nipun Aggarwal](https://bynipun.com) &nbsp;|&nbsp; **Status:** Live

---

## What Is This

ModEval is a live web tool that evaluates text content using 8 independent AI moderation models simultaneously: 3 enterprise APIs (Hive Moderation, Azure Content Safety, Google NLP), OpenAI Moderation, and 4 open source HuggingFace models. It normalizes their outputs into a unified format, uses AI-powered policy alignment to score each model's decision against real platform policies, and surfaces disagreements between models.

The core insight behind it: **no single moderation model should be trusted blindly.** The same piece of content can be classified completely differently depending on which model you use and what platform policy is being applied. ModEval makes those differences visible — and uses an AI interpretation layer to explain what those differences actually mean.

> "Disagreements are not errors — they are the most analytically interesting output ModEval produces."

---

## Why I Built This

I spent six years reviewing harmful content at scale — across Meta, Twitter, gaming platforms, and brand communities. In that time I developed one strong conviction: the hardest part of Trust & Safety isn't detecting obvious violations. It's the edge cases, the context-dependent calls, and the moments where different systems disagree.

When I moved into AI safety and red teaming, I started asking the same question about moderation models. How do they differ? When do they disagree? Which one aligns with Reddit's actual policy versus Discord's? There was no simple tool to answer that. So I built one.

ModEval is both a functional tool and a demonstration of applied AI governance thinking — the kind of work that sits at the intersection of policy, safety operations, and AI systems.

---

## What It Does

- Runs text through 8 moderation models in parallel: 3 enterprise APIs, OpenAI Moderation, and 4 open source HuggingFace models, each covering a distinct safety dimension
- Normalizes all outputs into a unified schema (category, confidence, action)
- Uses Claude Haiku to assess how well each model's decision aligns with the selected platform's actual content policy
- Detects and explains disagreements between models (action conflicts and category mismatches)
- Generates an AI executive summary that reads between the lines: identifies CLEAR VIOLATION, CLEAR SAFE, or GENUINE GREY AREA, flags model failures, and recommends whether human review is needed
- Includes a pre-loaded test case library with 100 real-world content examples across 10 violation categories
- Documents the full methodology in a dedicated "How It Works" tab
- Provides detailed model cards for all 8 models in a dedicated "Models" tab

---

## Models Used

ModEval runs 8 models in parallel across three groups. Enterprise APIs and OpenAI require their own credentials, while the 4 open source models run through the HuggingFace Inference API when `HF_API_KEY` is configured.

### Enterprise APIs

| Display Name | Provider | Safety Dimension |
|---|---|---|
| Hive Moderation | The Hive AI | Sexual, Violence, Hate, Bullying, Spam |
| Azure Content Safety | Microsoft | Hate, Violence, Sexual, Self-Harm |
| Google NLP | Google Cloud | 8-category moderation including weapons and drugs |

### Proprietary API

| Display Name | Provider | Safety Dimension |
|---|---|---|
| OpenAI Moderation | OpenAI | Multi-category (harassment, hate, violence, sexual, self-harm) |

### Open Source Models

| Display Name | Model | Architecture | Creator | Safety Dimension |
|---|---|---|---|---|
| toxic-bert | `unitary/toxic-bert` | BERT | Unitary AI | General toxicity baseline |
| RoBERTa Offensive | `cardiffnlp/twitter-roberta-base-offensive` | RoBERTa | Cardiff NLP | Social media offensive language |
| RoBERTa Hate Speech | `facebook/roberta-hate-speech-dynabench-r4-target` | RoBERTa | Facebook AI Research | Identity-based hate speech |
| DistilRoBERTa Bias | `valurank/distilroberta-bias` | DistilRoBERTa | Valurank | Non-neutral language detection |

---

## Try an Example

ModEval includes a built-in test case library with 100 pre-loaded content examples across 10 violation categories:

| Category | What It Tests |
|---|---|
| Toxicity | General toxic and abusive language |
| Harassment | Targeted threatening and intimidating content |
| Hate Speech | Content targeting protected groups |
| Spam | Scam, manipulative, and unsolicited content |
| Bias | Slanted, non-neutral, and manipulative framing |
| Violent Threats | Content inciting or glorifying violence |
| Misinformation | False claims presented as fact |
| Doxxing | Sharing or threatening to share personal information |
| Radicalization | Extremist recruitment and ideological incitement |
| Impersonation | Pretending to be someone else to deceive |

---

## Platform Policies Supported

| Platform | Source |
|---|---|
| Reddit | redditinc.com/policies/content-policy |
| Discord | discord.com/guidelines (effective September 29, 2025) |
| Facebook | transparency.meta.com/policies/community-standards |
| Instagram | transparency.meta.com/policies/community-standards (unified November 2024) |
| Custom | User-defined rules in plain text |

---

## Methodology

### Fixed Thresholds

All platforms use identical base thresholds for action assignment:
- Below 0.40 confidence → Allow
- 0.40–0.70 confidence → Review
- Above 0.70 confidence → Remove

The models themselves are frozen. Their scores cannot be changed.

### AI-Powered Policy Alignment

After all models return results, a single batched call to Claude Haiku evaluates each model's action against the selected platform's actual content policy. For each model it returns:
- `aligned` (bool) — is the action correct under this platform's policy?
- `alignment_score` (0.0–1.0) — how closely does it match?
- `alignment_reason` — plain English explanation referencing the actual content

This approach replaces keyword-based alignment scoring. Claude Haiku understands context and nuance: a model that flags the wrong category but takes the correct action is marked ALIGNED. A model that allows clearly violating content is marked MISALIGNED regardless of its category label.

### AI Executive Summary

After alignment assessment, a second Claude Haiku call generates an analytical interpretation acting as a senior T&S analyst:
- Identifies CLEAR VIOLATION, CLEAR SAFE, or GENUINE GREY AREA
- Explains what model disagreements reveal about the content
- Flags model failures (0.00 confidence on harmful content)
- Recommends whether human review is needed
- Never just summarizes — always reads between the lines

### Disagreement Detection

| Type | Definition |
|---|---|
| Action Mismatch | Models recommend different actions |
| Category Mismatch | Models flag different top violation categories |

### Known Limitations

- **Models Are Frozen** — scores reflect training data, novel slang may score incorrectly
- **Platform Policies Are Approximations** — real enforcement involves human judgment and account history
- **English Only** — all models trained primarily on English data
- **Text Only** — images, video, and audio are outside scope
- **Free Tier Rate Limits** — HuggingFace free tier may rate-limit under high traffic

---

## UI Features

- **Alloy Night theme** — React/Vite rebuild with dark ink-blue + cyan accent (shadcn/ui)
- **Three tabs** — Analysis, How It Works, Models
- **Single Platform selector** — Reddit, Discord, Facebook, Instagram, Custom with live policy guidelines shown below
- **Execute Analysis button** — runs all 8 models in parallel
- **Summary tab** — consensus verdict (ALLOW/REVIEW/REMOVE), donut chart showing model vote distribution
- **Model Breakdown tab** — card-per-row layout showing category, confidence, and action per model
- **AI Interpretation tab** — 3-card top grid (Disagreement Vector, Most Lenient, Strictest Model), full policy alignment assessment matrix, and elevated AI executive summary with MODEL CONFIDENCE bars and Claude Haiku disclaimer
- **Disagreement Banner** — high-contrast alert when models conflict
- **Skeleton shimmer loading** — premium loading state while models run
- **Model Cards** — detailed cards for all 8 models with architecture, training data, strengths, and limitations
- **Dynamic Models Active indicator** — reflects count of configured models in topbar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, Flask 3.1, Gunicorn |
| Enterprise APIs | Hive Moderation, Azure Content Safety, Google NLP |
| Proprietary API | OpenAI Moderation |
| Open Source Models | HuggingFace Inference API (4 models) |
| AI Interpretation | Claude Haiku (claude-haiku-4-5-20251001) via Anthropic API |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui (Alloy Night theme) |
| Fonts | DM Serif Display, Inter, JetBrains Mono |
| Deployment | Vercel frontend + Hetzner VPS backend API |
| Version Control | Git + GitHub |

---

## Local Development Setup

The production UI is on Vercel; the Flask app is **API-only** and does not serve the React frontend.

```bash
# Terminal 1 — API (optional for local backend work)
pip install -r backend/requirements.txt
py -m flask --app backend/app.py run
# Health: http://127.0.0.1:5000/health

# Terminal 2 — React frontend
cd frontend
npm install
npm run dev
# Open the URL Vite prints (typically http://127.0.0.1:5173).
# In dev, /api is proxied to https://modeval-api.bynipun.com.
```

Production builds call `https://modeval-api.bynipun.com` directly (`import.meta.env.DEV` is false).

---

## Future Improvements

**In Progress / Planned:**

- **Did You Know tab** — Platform knowledge cards for Reddit, Discord, Facebook, and Instagram featuring key policy facts, enforcement statistics from official transparency reports, and interesting moderation quirks. Deferred to ensure quality over quantity.
- **Human vs AI comparison mode** — Submit your own moderation decision and compare it against all 5 model outputs to see where human judgment diverges from automated systems
- **Red team mode** — Structured library of adversarial edge cases for systematic model stress-testing, inspired by real red teaming workflows
- **Export results** — Download analysis results as CSV or PDF for reporting and documentation
- **Model leaderboard** — Aggregate alignment scores across all analyses to rank model performance by platform and violation category
- **Prompt injection resistance testing** — Test whether policy instructions can be overridden via adversarial input in the custom policy field
- **Multilingual support** — Extend coverage to non-English content using multilingual model variants
- **G2-style model marketplace** — Long-term vision: aggregate benchmark data across all analyses to build the first independent public leaderboard ranking moderation APIs by accuracy, strictness, and policy alignment across platforms and violation categories

---

## About the Builder

**Nipun Aggarwal** — Trust & Safety professional with 6+ years across content moderation, platform safety, LLM training, and red teaming.

Currently a Safety Red Teaming Analyst at Mercor, adversarially testing large language models to find where guardrails break. Previously at Khoros, Turing, Tech Mahindra, and Cognizant across Meta, Twitter, and gaming platform ecosystems.

Transitioning into AI Governance and Responsible AI. ModEval is a direct expression of that work — applying operational T&S instincts to the problem of evaluating AI moderation systems at scale.

- Portfolio: [bynipun.com](https://bynipun.com)
- LinkedIn: [linkedin.com/in/nipun-agarwal-](https://linkedin.com/in/nipun-agarwal-/)
- Email: hello@bynipun.com
