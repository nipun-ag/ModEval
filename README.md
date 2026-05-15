# ModEval — Context & Policy-Aware AI Moderation Evaluation System

**Live:** [modeval.bynipun.com](https://modeval.bynipun.com) &nbsp;|&nbsp; **Built by:** [Nipun Aggarwal](https://bynipun.com) &nbsp;|&nbsp; **Status:** Live

---

## What Is This

ModEval is a live web tool that evaluates text content using up to nine AI moderation models simultaneously — four enterprise APIs (Perspective API, Azure Content Safety, AWS Comprehend, Google NLP) alongside five open source models. It normalizes their outputs into a unified format, applies platform context and strictness rules, scores each model's alignment with real platform policies, and surfaces disagreements between models.

The core insight behind it: **no single moderation model should be trusted blindly.** The same piece of content can be classified completely differently depending on which model you use, what platform it appears on, and what policy framework is being applied. ModEval makes those differences visible.

> "Disagreements are not errors — they are the most analytically interesting output ModEval produces."

---

## Why I Built This

I spent six years reviewing harmful content at scale — across Meta, Twitter, gaming platforms, and brand communities. In that time I developed one strong conviction: the hardest part of Trust & Safety isn't detecting obvious violations. It's the edge cases, the context-dependent calls, and the moments where different systems disagree.

When I moved into AI safety and red teaming, I started asking the same question about moderation models. How do they differ? When do they disagree? Which one aligns with Reddit's actual policy versus Discord's? There was no simple tool to answer that. So I built one.

ModEval is both a functional tool and a demonstration of applied AI governance thinking — the kind of work that sits at the intersection of policy, safety operations, and AI systems.

---

## What It Does

- Runs text through up to nine moderation models in parallel -- four enterprise APIs and five open source models, each covering a distinct safety dimension
- Normalizes all outputs into a unified schema (category, severity, confidence, action)
- Adjusts decision thresholds based on platform context (Social Media, Gaming, Professional, Community/Forum, VR/Metaverse)
- Adjusts further based on content type (Original Post, Comment/Reply, Username, Bio, UGC) and strictness level
- Scores each model's alignment with the selected platform's real policy
- Detects and explains disagreements between models (action conflicts, category mismatches, severity gaps)
- Surfaces an explainability layer showing what each model flagged and why
- Includes a pre-loaded test case library with 100 real-world content examples across 10 violation categories
- Documents the full methodology in a dedicated "How It Works" tab
- Provides detailed model cards for all 9 models (enterprise and open source) in a dedicated "Models" tab

---

## Models Used

ModEval runs up to nine models in parallel across two tiers. Enterprise APIs require credentials configured in environment variables. Open source models run via the HuggingFace Inference API and are always available.

### Enterprise APIs

| Display Name | Provider | Safety Dimension |
|---|---|---|
| Perspective API | Google / Jigsaw | Toxicity and civil discourse (6 attributes) |
| Azure Content Safety | Microsoft | Hate, Violence, Sexual, Self-Harm |
| AWS Comprehend | Amazon | Violence, Hate, Harassment, Sexual, Insult, Profanity |
| Google NLP | Google Cloud | 8-category moderation including weapons and drugs |
| OpenAI Moderation | OpenAI | Multi-category (harassment, hate, violence, sexual, self-harm) |

### Open Source Models

| Display Name | Model | Architecture | Creator | Safety Dimension |
|---|---|---|---|---|
| Toxicity Classifier | `unitary/toxic-bert` | BERT | Unitary AI | General toxicity baseline |
| Offensive Language Detector | `cardiffnlp/twitter-roberta-base-offensive` | RoBERTa | Cardiff NLP | Social media offensive language |
| Hate Speech Detector | `facebook/roberta-hate-speech-dynabench-r4-target` | RoBERTa | Facebook AI Research | Identity-based hate speech |
| Spam Detector | `mrm8488/bert-tiny-finetuned-sms-spam-detection` | BERT-tiny | Manuel Romero | Spam and manipulative content |
| Bias Detector | `valurank/distilroberta-bias` | DistilRoBERTa | Valurank | Non-neutral language detection |

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

### Context Engine

The models themselves are frozen -- their scores cannot be changed. The Context Engine adjusts the decision threshold at which a score triggers a Review or Remove action. This mirrors how real T&S pipelines work.

```
adjusted_threshold = base_threshold + platform_modifier + content_type_modifier + strictness_modifier
```

All thresholds are clamped between 0.10 and 0.90.

**Platform modifiers:**

| Platform | Modifier | Rationale |
|---|---|---|
| Social Media | 0.00 | Baseline |
| Gaming | -0.10 | Higher tolerance for competitive language |
| Professional | +0.15 | Lower tolerance, reputational risk |
| Community / Forum | -0.05 | Slightly higher tolerance for debate |
| VR / Metaverse | -0.15 | Evolving norms, higher tolerance |

### Policy Alignment Scoring

```
alignment_score = 1 - abs(model_confidence - policy_expected_threshold)
```

### Disagreement Detection

| Type | Definition |
|---|---|
| Action Mismatch | Models recommend different actions |
| Category Mismatch | Models flag different top violation categories |
| Severity Gap | Severity scores differ by 3 or more points |

### Known Limitations

- **Models Are Frozen** — scores reflect training data, novel slang may score incorrectly
- **Platform Policies Are Approximations** — real enforcement involves human judgment and account history
- **English Only** — all five models trained primarily on English data
- **Text Only** — images, video, and audio are outside scope
- **Free Tier Rate Limits** — HuggingFace free tier may rate-limit under high traffic

---

## UI Features

- **Premium dark theme** — enterprise-grade UI inspired by Vercel, Stripe, and OpenAI
- **Four tabs** — Analysis, How It Works, Models, (Did You Know planned)
- **Topbar navigation** — ANALYSIS (active) and BENCHMARK (locked) tabs for switching between analysis workspace and benchmark preview
- **Modal overlay selectors** — all three context dropdowns open as centered modals with blurred backdrop, animating from the trigger button position
- **Try an Example** — 100 pre-loaded test cases across 10 violation categories
- **Analysis Context** — Platform Context, Content Type, and Strictness with descriptive option labels
- **Consensus Hero Card** — leads results with large action word (ALLOW/REVIEW/REMOVE), AI summary subtitle, and verdict visuals
- **Verdict Visuals Row** — donut chart showing model vote distribution, severity arc gauge (1-10), and action legend
- **Two-Tier Decision Matrix** — Enterprise APIs and Open Source Models rendered as separate tables, each with independent column headers and section labels
- **Decision Matrix** — comparison table with model chip badges, color-coded action badges, alignment scores
- **Insight Strip** — strictest model, most lenient model, consensus recommendation with plain-English explainers
- **Disagreement Banner** — high-contrast alert when models conflict
- **AI Consensus Summary** — GPT-4o-mini analyzes all active model results and generates a 2-3 sentence plain English interpretation, surfacing model agreements, disagreements, and safety recommendation
- **AI Interpretation Layer (Section 6.5)** — Documents the GPT-4o-mini synthesis layer, inputs, outputs, and fallback behavior
- **Skeleton shimmer loading** — premium loading state while models run
- **Model Cards** — detailed cards for all 5 models with architecture, training data, strengths, limitations, and HuggingFace links
- **Dynamic Models Active** indicator in navigation — reflects count of configured models (up to 9)
- **Benchmark Placeholder Panel** — preview of upcoming benchmark features with skeleton leaderboard and feature preview cards
- **Ambient glow blobs** — subtle blue and purple glow layers behind results panel for visual depth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.14, Flask 3.1, Gunicorn |
| Enterprise APIs | Perspective API, Azure Content Safety, AWS Comprehend, Google NLP, OpenAI Moderation |
| Open Source Models | HuggingFace Inference API (4 models) |
| AI Summary | OpenAI GPT-4o-mini |
| Frontend | Plain HTML, CSS, JavaScript |
| Fonts | DM Serif Display, Inter, JetBrains Mono |
| Deployment | Hetzner VPS (self-hosted) |
| Version Control | Git + GitHub |

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
