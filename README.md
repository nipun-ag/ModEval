# ModEval — Context & Policy-Aware AI Moderation Evaluation System

**Live:** [modeval.onrender.com](https://modeval.onrender.com) &nbsp;|&nbsp; **Built by:** [Nipun Aggarwal](https://bynipun.com) &nbsp;|&nbsp; **Status:** Live

---

## What Is This

ModEval is a live web tool that evaluates text content using five independent AI moderation models simultaneously across five distinct safety dimensions. It normalizes their outputs into a unified format, applies platform context and strictness rules, scores each model's alignment with real platform policies, and surfaces disagreements between models.

The core insight behind it: **no single moderation model should be trusted blindly.** The same piece of content can be classified completely differently depending on which model you use, what platform it appears on, and what policy framework is being applied. ModEval makes those differences visible.

> "Disagreements are not errors — they are the most analytically interesting output ModEval produces."

---

## Why I Built This

I spent six years reviewing harmful content at scale — across Meta, Twitter, gaming platforms, and brand communities. In that time I developed one strong conviction: the hardest part of Trust & Safety isn't detecting obvious violations. It's the edge cases, the context-dependent calls, and the moments where different systems disagree.

When I moved into AI safety and red teaming, I started asking the same question about moderation models. How do they differ? When do they disagree? Which one aligns with Reddit's actual policy versus Discord's? There was no simple tool to answer that. So I built one.

ModEval is both a functional tool and a demonstration of applied AI governance thinking — the kind of work that sits at the intersection of policy, safety operations, and AI systems.

---

## What It Does

- Runs text through five independent moderation models in parallel, each covering a different safety dimension
- Normalizes all outputs into a unified schema (category, severity, confidence, action)
- Adjusts decision thresholds based on platform context (Social Media, Gaming, Professional, Community/Forum, VR/Metaverse)
- Adjusts further based on content type (Original Post, Comment/Reply, Username, Bio, UGC) and strictness level
- Scores each model's alignment with the selected platform's real policy
- Detects and explains disagreements between models (action conflicts, category mismatches, severity gaps)
- Surfaces an explainability layer showing what each model flagged and why
- Includes a pre-loaded test case library with 100 real-world content examples across 10 violation categories
- Documents the full methodology in a dedicated "How It Works" tab
- Provides platform knowledge and policy facts in a "Did You Know" tab

---

## Models Used

All five models are free and run via the HuggingFace Inference API. Each covers a distinct safety dimension, simulating a real multi-layer Trust & Safety pipeline.

| Display Name | Model | Architecture | Training Data | Safety Dimension |
|---|---|---|---|---|
| Toxicity Classifier | `unitary/toxic-bert` | BERT | Jigsaw Toxic Comments | General toxicity baseline |
| Offensive Language Detector | `cardiffnlp/twitter-roberta-base-offensive` | RoBERTa | Twitter data | Social media offensive language |
| Hate Speech Detector | `facebook/roberta-hate-speech-dynabench-r4-target` | RoBERTa | DynaBench R4 | Adversarially collected hate speech |
| Spam Detector | `mrm8488/bert-tiny-finetuned-sms-spam-detection` | BERT-tiny | SMS Spam Collection | Manipulation and unsolicited content |
| Bias Detector | `valurank/distilroberta-bias` | DistilRoBERTa | Wikipedia revisions | Non-neutral language detection |

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
- **Three tabs** — Analysis, How It Works (full methodology), Did You Know (platform facts)
- **Modal overlay selectors** — all three context dropdowns open as centered modals with blurred backdrop, animating from the trigger button position
- **Try an Example** — 100 pre-loaded test cases across 10 violation categories
- **Analysis Context** — Platform Context, Content Type, and Strictness each with descriptive option labels
- **Decision Matrix** — comparison table with model chip badges, color-coded action badges, alignment scores
- **Insight Strip** — strictest model, most lenient model, consensus recommendation with plain-English explainers
- **Disagreement Banner** — high-contrast alert when models conflict
- **Explainability Cards** — 2-column grid per-model breakdown
- **Skeleton shimmer loading** — premium loading state while models run
- **5 Models Active** indicator in navigation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.14, Flask 3.1, Gunicorn |
| Model Integration | HuggingFace Inference API (5 models) |
| Frontend | Plain HTML, CSS, JavaScript |
| Fonts | DM Serif Display, Inter, JetBrains Mono |
| Deployment | Render (free tier) |
| Version Control | Git + GitHub |

---

## Project Structure

```
modeval/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── routes/
│   │   ├── analyze.py
│   │   └── batch.py
│   ├── models/
│   │   ├── hf_toxic_bert.py
│   │   ├── hf_roberta_offensive.py
│   │   ├── hf_hate_speech.py
│   │   ├── hf_spam.py
│   │   └── hf_bias.py
│   └── engine/
│       ├── normalizer.py
│       ├── context_engine.py
│       ├── policy_engine.py
│       ├── comparison.py
│       └── explainer.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .gitignore
└── README.md
```

---

## API Endpoints

### POST /analyze

```json
{
  "text": "string",
  "platform_context": "Social Media | Gaming | Professional | Forum | VR/Metaverse",
  "content_type": "Original Post | Comment/Reply | Username | Bio | UGC",
  "strictness": "Strict | Balanced | Lenient",
  "policy": "Reddit | Discord | Facebook | Instagram | Custom",
  "custom_policy_text": "string (optional)"
}
```

### POST /batch-analyze
Multiple inputs with same context settings. Returns aggregate flag rate and per-item results.

### GET /health
Health check endpoint for Render uptime monitoring.

---

## Running Locally

```bash
git clone https://github.com/nipun-ag/ModEval.git
cd ModEval
echo HF_API_KEY=your_token > .env
cd backend
pip install -r requirements.txt
cd ..
py -m flask --app backend/app.py run
```

Open `http://127.0.0.1:5000`

---

## Environment Variables

```
HF_API_KEY=your_huggingface_token
```

Free token at huggingface.co/settings/tokens. Read access only. Single key covers all five models. Never commit this file.

---

## Deployment

**Platform:** Render (free tier)
**Build:** `pip install -r backend/requirements.txt`
**Start:** `gunicorn --chdir backend app:app`
**Env vars:** Set `HF_API_KEY` in Render dashboard
**Auto-deploy:** On every push to `main`

---

## Future Improvements

- Human vs AI comparison mode
- Red team mode with adversarial edge case library
- Export results as CSV or PDF
- Model leaderboard aggregating alignment scores
- Prompt injection resistance testing
- Multilingual support
- Paid API integrations (AWS Comprehend, Azure Content Moderator, Clarifai)

---

## About the Builder

**Nipun Aggarwal** — Trust & Safety professional with 6+ years across content moderation, platform safety, LLM training, and red teaming.

Currently a Safety Red Teaming Analyst at Mercor, adversarially testing large language models to find where guardrails break. Previously at Khoros, Turing, Tech Mahindra, and Cognizant across Meta, Twitter, and gaming platform ecosystems.

Transitioning into AI Governance and Responsible AI. ModEval is a direct expression of that work — applying operational T&S instincts to the problem of evaluating AI moderation systems at scale.

- Portfolio: [bynipun.com](https://bynipun.com)
- LinkedIn: [linkedin.com/in/nipun-agarwal-](https://linkedin.com/in/nipun-agarwal-/)
- Email: hello@bynipun.com