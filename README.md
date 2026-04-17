# ModEval — Context & Policy-Aware AI Moderation Evaluation System

**Live:** [modeval.onrender.com](https://modeval.onrender.com) &nbsp;|&nbsp; **Built by:** [Nipun Aggarwal](https://bynipun.com) &nbsp;|&nbsp; **Status:** Live

---

## What Is This

ModEval is a live web tool that evaluates text content using five independent AI moderation models simultaneously across five distinct safety dimensions. It normalizes their outputs into a unified format, applies platform context and strictness rules, scores each model's alignment with real platform policies, and surfaces disagreements between models.

The core insight behind it: **no single moderation model should be trusted blindly.** The same piece of content can be classified completely differently depending on which model you use, what platform it appears on, and what policy framework is being applied. ModEval makes those differences visible.

---

## Why I Built This

I spent six years reviewing harmful content at scale — across Meta, Twitter, gaming platforms, and brand communities. In that time I developed one strong conviction: the hardest part of Trust & Safety isn't detecting obvious violations. It's the edge cases, the context-dependent calls, and the moments where different systems disagree.

When I moved into AI safety and red teaming, I started asking the same question about moderation models. How do they differ? When do they disagree? Which one aligns with Reddit's actual policy versus Discord's? There was no simple tool to answer that. So I built one.

ModEval is both a functional tool and a demonstration of applied AI governance thinking — the kind of work that sits at the intersection of policy, safety operations, and AI systems.

---

## What It Does

- Runs text through five independent moderation models in parallel, each covering a different safety dimension
- Normalizes all outputs into a unified schema (category, severity, confidence, action)
- Adjusts evaluation thresholds based on platform context (Gaming, Social Media, Professional, Forum, VR)
- Adjusts further based on content type (Original Post, Comment, Username, Bio, UGC) and strictness level
- Scores each model's alignment with the selected platform's real policy
- Detects and explains disagreements between models (action conflicts, category mismatches, severity gaps)
- Surfaces an explainability layer showing what each model flagged and why
- Displays official policy guidelines for each platform, sourced directly from their public policy pages
- Includes a pre-loaded test case library with 100 real-world content examples across 10 violation categories

---

## Models Used

All five models are free and run via the HuggingFace Inference API. Each covers a distinct safety dimension, simulating a real multi-layer Trust & Safety pipeline.

| Display Name | Model | Safety Dimension |
|---|---|---|
| Toxicity Classifier | `unitary/toxic-bert` | General toxicity, insults, threats, obscenity |
| Offensive Language Detector | `cardiffnlp/twitter-roberta-base-offensive` | Offensive and harassing language |
| Hate Speech Detector | `facebook/roberta-hate-speech-dynabench-r4-target` | Hate speech targeting protected groups |
| Spam Detector | `mrm8488/bert-tiny-finetuned-sms-spam-detection` | Spam, scams, and manipulative content |
| Bias Detector | `valurank/distilroberta-bias` | Biased and non-neutral language |

Each model uses a different architecture and training dataset. The value of ModEval comes from seeing how genuinely independent systems interpret the same content across multiple safety lenses simultaneously.

---

## Try an Example

ModEval includes a built-in test case library with 100 pre-loaded content examples across 10 violation categories. Click any category button to instantly load a random example into the input field:

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

Each click loads a different random example from that category. No need to think of test cases yourself.

---

## Platform Policies Supported

ModEval includes official policy guidelines for each platform, sourced directly from their public policy pages and displayed as a collapsible card in the interface.

| Platform | Source |
|---|---|
| Reddit | redditinc.com/policies/content-policy |
| Discord | discord.com/guidelines (effective September 29, 2025) |
| Facebook | transparency.meta.com/policies/community-standards |
| Instagram | transparency.meta.com/policies/community-standards (unified November 2024) |
| Custom | User-defined rules in plain text |

---

## Context Engine

The Context Engine modifies action thresholds before the final recommendation is determined. It does not change raw model scores — it shifts the threshold at which a score triggers Review or Remove.

**Platform modifiers:**

| Platform | Threshold Shift | Rationale |
|---|---|---|
| Gaming | -0.10 | Higher tolerance for competitive language |
| Social Media | 0.00 | Baseline |
| Professional | +0.15 | Lower tolerance, reputational risk |
| Forum | -0.05 | Slightly higher tolerance for debate |
| VR / Metaverse | -0.15 | Evolving norms, higher tolerance |

**Content type and strictness modifiers apply on top of platform modifiers.** Final thresholds are clamped between 0.10 and 0.90.

---

## UI Features

- **Light theme** — clean white and light grey surfaces, data-forward design inspired by Google and Apple product aesthetics
- **Two-panel layout** — inputs on the left, results on the right
- **Analysis Context** — collapsible section grouping platform context, content type, and strictness controls
- **Policy Guidelines card** — collapsible card showing official platform policy bullet points with source citations
- **Try an Example** — 100 pre-loaded test cases across 10 violation categories, randomly served on click
- **Decision Matrix** — comparison table with color-coded action badges and inline alignment scores
- **Insight Strip** — surfaces the strictest model, most lenient model, and consensus recommendation with plain-English explainers
- **Disagreement Banner** — compact alert when models conflict on action or category
- **Explainability Cards** — 2-column grid, per-model breakdown of what was flagged and why
- **5 Models Active** indicator in the navigation bar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.14, Flask 3.1, Gunicorn |
| Model Integration | HuggingFace Inference API (5 models) |
| Frontend | Plain HTML, CSS, JavaScript |
| Fonts | Inter, DM Serif Display (Google Fonts) |
| Deployment | Render (free tier) |
| Version Control | Git + GitHub |

---

## Project Structure

```
modeval/
├── backend/
│   ├── app.py                        # Flask entry point
│   ├── config.py                     # Environment variable loading
│   ├── requirements.txt
│   ├── routes/
│   │   ├── analyze.py                # POST /analyze
│   │   └── batch.py                  # POST /batch-analyze
│   ├── models/
│   │   ├── hf_toxic_bert.py          # Toxicity Classifier
│   │   ├── hf_roberta_offensive.py   # Offensive Language Detector
│   │   ├── hf_hate_speech.py         # Hate Speech Detector
│   │   ├── hf_spam.py                # Spam Detector
│   │   └── hf_bias.py                # Bias Detector
│   └── engine/
│       ├── normalizer.py             # Output normalization
│       ├── context_engine.py         # Threshold adjustment
│       ├── policy_engine.py          # Policy alignment scoring
│       ├── comparison.py             # Disagreement detection
│       └── explainer.py              # Explainability text
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
// Request
{
  "text": "string",
  "platform_context": "Gaming | Social Media | Professional | Forum | VR/Metaverse",
  "content_type": "Original Post | Comment/Reply | Username | Bio | UGC",
  "strictness": "Strict | Balanced | Lenient",
  "policy": "Reddit | Discord | Facebook | Instagram | Custom",
  "custom_policy_text": "string (optional)"
}

// Response
{
  "results": [
    {
      "model": "string",
      "top_category": "string",
      "severity": 0,
      "confidence": 0.0,
      "action": "Allow | Review | Remove",
      "flagged": true,
      "alignment_score": 0.0,
      "aligned": true,
      "explanation": "string"
    }
  ],
  "disagreements": [
    {
      "type": "Action Mismatch | Category Mismatch | Severity Gap",
      "description": "string"
    }
  ],
  "insights": {
    "strictest_model": "string",
    "most_lenient_model": "string",
    "consensus_action": "Allow | Review | Remove | No Consensus",
    "summary": "string"
  }
}
```

### POST /batch-analyze
Accepts multiple text inputs with the same context settings. Returns aggregate flag rate and per-item results.

### GET /health
Health check endpoint used by Render for uptime monitoring.

---

## Running Locally

**Requirements:** Python 3.12+, pip

```bash
# Clone the repo
git clone https://github.com/nipun-ag/ModEval.git
cd ModEval

# Create .env file in root and add your API key
# (see Environment Variables section below)

# Install dependencies
cd backend
pip install -r requirements.txt

# Run the Flask server from project root
cd ..
py -m flask --app backend/app.py run
```

Open `http://127.0.0.1:5000` in your browser.

---

## Environment Variables

Create a `.env` file in the project root with the following key:

```
HF_API_KEY=your_huggingface_token
```

Get a free HuggingFace token at huggingface.co/settings/tokens. Read access is sufficient. This single key covers all five models.

The `.env` file is gitignored and must never be committed.

---

## Deployment

ModEval is deployed on Render as a Python Web Service.

**Build command:** `pip install -r backend/requirements.txt`
**Start command:** `gunicorn --chdir backend app:app`
**Environment variables:** Set `HF_API_KEY` in Render's Environment dashboard
**Auto-deploy:** Enabled on every push to `main`

---

## Future Improvements

- Human vs AI comparison mode — submit your own moderation decision and compare it against model outputs
- Red team mode — structured library of adversarial edge cases for systematic model stress-testing
- Export results as CSV or PDF
- Model leaderboard — aggregate alignment scores across all analyses to rank model performance by platform
- Prompt injection resistance testing — test whether policy instructions can be overridden via adversarial input
- Multilingual support — extend coverage to non-English content
- Paid API integrations — AWS Comprehend, Azure Content Moderator, Clarifai

---

## About the Builder

**Nipun Aggarwal** — Trust & Safety professional with 6+ years across content moderation, platform safety, LLM training, and red teaming.

Currently a Safety Red Teaming Analyst at Mercor, adversarially testing large language models to find where guardrails break. Previously at Khoros, Turing, Tech Mahindra, and Cognizant across Meta, Twitter, and gaming platform ecosystems.

Transitioning into AI Governance and Responsible AI. ModEval is a direct expression of that work — applying operational T&S instincts to the problem of evaluating AI moderation systems at scale.

- Portfolio: [bynipun.com](https://bynipun.com)
- LinkedIn: [linkedin.com/in/nipun-agarwal-](https://linkedin.com/in/nipun-agarwal-/)
- Email: hello@bynipun.com