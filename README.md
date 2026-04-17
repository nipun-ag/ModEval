# ModEval – Context & Policy-Aware Moderation Evaluation System
**Version:** 3.0  
**Status:** Finalized  
**Author:** Nipun Aggarwal  
**Last Updated:** April 2026

---

## 1. Overview

ModEval is a live, web-based platform that evaluates text content using multiple free AI moderation APIs simultaneously. It normalizes their outputs into a unified format, applies platform context and strictness rules, scores each model's alignment with real-world platform policies, and surfaces disagreements between models.

The goal is to replicate the kind of evaluation workflow used by Trust & Safety teams at scale — where no single model is trusted blindly, context determines the threshold, and policy governs the final action.

ModEval is both a functional tool and a portfolio artifact demonstrating applied knowledge of AI moderation systems, policy alignment, and Trust & Safety operations.

---

## 2. Problem Statement

AI moderation models are not interchangeable. The same piece of content can be classified differently depending on the model used, the platform context it appears in, and the policy framework being applied. There is currently no simple tool that:

- Runs multiple free moderation models on the same input simultaneously
- Normalizes their outputs into a comparable format
- Adjusts evaluation thresholds based on platform context and strictness
- Measures whether each model's output aligns with a given platform's policy
- Flags and explains disagreements between models

ModEval solves this.

---

## 3. Core Objectives

1. Evaluate a text input using three real moderation APIs in parallel
2. Normalize all outputs into a single unified schema
3. Apply context adjustments based on platform type, content type, and strictness level
4. Apply predefined or custom platform policies to score alignment
5. Compare model outputs and detect disagreements
6. Surface an explainability layer showing flagged categories and context-adjusted reasoning
7. Deploy live with a custom domain as a publicly accessible tool

---

## 4. Models Used

All models used are free to access.

### 4.1 Perspective API (Google Jigsaw)
- **Access:** Free with a Google Cloud project and API key
- **What it returns:** Scores (0–1) for: TOXICITY, SEVERE_TOXICITY, INSULT, THREAT, PROFANITY, IDENTITY_ATTACK, SEXUALLY_EXPLICIT
- **Strength:** Best-in-class for conversational toxicity; widely used in real T&S pipelines
- **Docs:** https://developers.perspectiveapi.com

### 4.2 OpenAI Moderation API
- **Access:** Free endpoint — does not require a paid GPT subscription. Requires an OpenAI account.
- **Endpoint:** `POST https://api.openai.com/v1/moderations`
- **What it returns:** Boolean flags + scores for: hate, hate/threatening, harassment, harassment/threatening, self-harm, self-harm/intent, self-harm/instructions, sexual, sexual/minors, violence, violence/graphic
- **Strength:** Broad category coverage, especially for self-harm and sexual content
- **Docs:** https://platform.openai.com/docs/guides/moderation

### 4.3 HuggingFace Inference API — `unitary/toxic-bert`
- **Access:** Free tier via HuggingFace Inference API (rate-limited)
- **Model:** `unitary/toxic-bert` — fine-tuned BERT for toxic comment classification
- **What it returns:** Labels with scores: toxic, severe_toxic, obscene, threat, insult, identity_hate
- **Strength:** Open-source, independent from Google and OpenAI; adds a third reference point
- **Docs:** https://huggingface.co/unitary/toxic-bert
- **Fallback:** If rate-limited, surface a clear error state in the UI rather than silently failing

---

## 5. Normalized Output Schema

Every model's raw output is converted into the following unified format before any further processing:

```json
{
  "model": "string",
  "raw_scores": { "category_name": 0.0 },
  "top_category": "string",
  "severity": 1,
  "confidence": 0.0,
  "action": "Allow | Review | Remove",
  "flagged": true
}
```

**Field definitions:**

| Field | Type | Description |
|---|---|---|
| `model` | string | Name of the model (e.g. "Perspective API") |
| `raw_scores` | object | Original scores returned by the API, preserved for transparency |
| `top_category` | string | The highest-scoring violation category |
| `severity` | int 1–10 | Derived from the highest raw score, scaled linearly |
| `confidence` | float 0–1 | The highest raw score, treated as confidence |
| `action` | string | Final recommended action (see thresholds below) |
| `flagged` | boolean | Whether the content crosses the action threshold |

**Default action thresholds (before context adjustment):**

| Confidence | Action |
|---|---|
| 0.0 – 0.39 | Allow |
| 0.40 – 0.69 | Review |
| 0.70 – 1.0 | Remove |

---

## 6. Context Engine

The Context Engine modifies action thresholds before the final action is determined. It does not change the raw scores — it shifts the threshold at which a score triggers Review or Remove.

### 6.1 Platform Context

| Platform | Threshold Modifier | Rationale |
|---|---|---|
| Gaming | -0.10 | Higher tolerance for aggression and competitive language |
| Social Media | 0.00 | Baseline |
| Professional | +0.15 | Lower tolerance; reputational risk is high |
| Forum | -0.05 | Slightly higher tolerance for debate and blunt speech |
| VR / Metaverse | -0.15 | Behavioral norms are still evolving; higher tolerance applied |

### 6.2 Content Type

| Content Type | Threshold Modifier | Rationale |
|---|---|---|
| Original Post | 0.00 | Baseline |
| Comment / Reply | -0.05 | Replies are often reactive; slight tolerance |
| Username | +0.20 | Permanent, identity-linked; very low tolerance |
| Bio | +0.15 | Persistent, public-facing content |
| UGC | -0.05 | User-generated creative content; some leeway |

### 6.3 Strictness Level

| Strictness | Threshold Modifier |
|---|---|
| Strict | +0.15 |
| Balanced | 0.00 |
| Lenient | -0.15 |

### 6.4 Final Threshold Calculation

```
adjusted_threshold = base_threshold + platform_modifier + content_type_modifier + strictness_modifier
```

The adjusted threshold replaces the default thresholds for determining the final action. Thresholds are clamped between 0.10 and 0.90 to prevent extreme values.

---

## 7. Platform Policy Engine

### 7.1 Predefined Policies

Each predefined platform policy defines which violation categories are zero-tolerance (auto-Remove regardless of score) and which categories are deprioritized (threshold raised by +0.20).

| Platform | Zero Tolerance Categories | Deprioritized Categories |
|---|---|---|
| Reddit | violence, self-harm, sexual/minors | profanity, insult |
| Discord | harassment/threatening, sexual/minors, hate | profanity |
| Facebook | hate, violence, sexual, self-harm | none |
| Instagram | sexual/minors, harassment, identity_attack | profanity, insult |

### 7.2 Custom Policy Input

When "Custom" is selected, the user is shown a free-text field. They define their own rules in plain English. Example:

> "Flag any mention of self-harm or suicide immediately. Allow profanity unless it is directed at a person."

Custom policy text is passed to the backend and used to generate a policy summary displayed alongside results. Custom policies do not modify API calls — they are evaluated post-normalization by applying keyword and category matching logic defined in the backend.

### 7.3 Policy Alignment Score

After the context-adjusted action is determined, the Policy Alignment Score measures whether the model's output is consistent with the selected platform's expected behavior.

```
alignment_score = 1 - abs(model_confidence - policy_expected_threshold)
```

Displayed as a value 0–1 alongside a binary label: **Aligned** / **Misaligned**.

---

## 8. Disagreement Detection

A disagreement is flagged when two or more models produce different final actions for the same input after context adjustment.

**Disagreement types:**

| Type | Definition |
|---|---|
| Action Mismatch | Models recommend different actions (e.g. Allow vs Remove) |
| Category Mismatch | Models flag different top categories |
| Severity Gap | Severity scores differ by 3 or more points |

When a disagreement is detected, a warning banner is shown in the results panel with the specific conflict described in plain language. Example:

> "Perspective API recommends Remove (Toxicity: 0.82) while toxic-bert recommends Allow (Toxic: 0.31). Severity gap: 5 points."

---

## 9. Explainability Layer

For each model result, the following is surfaced:

- **Top flagged category** and its score
- **All categories above 0.30** listed with scores
- **Context adjustment summary**: a plain-English sentence describing how context shifted the threshold. Example: "Professional platform + Username content type raised the Remove threshold by 0.35."
- **Policy note**: whether this result aligns or conflicts with the selected platform's known policy

The explainability layer is displayed as a collapsible panel below the comparison table.

---

## 10. API Contract

### 10.1 POST /analyze

**Request body:**
```json
{
  "text": "string",
  "platform_context": "Gaming | Social Media | Professional | Forum | VR/Metaverse",
  "content_type": "Original Post | Comment/Reply | Username | Bio | UGC",
  "strictness": "Strict | Balanced | Lenient",
  "policy": "Reddit | Discord | Facebook | Instagram | Custom",
  "custom_policy_text": "string (only if policy = Custom)"
}
```

**Response body:**
```json
{
  "results": [
    {
      "model": "string",
      "raw_scores": {},
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

### 10.2 POST /batch-analyze

**Request body:**
```json
{
  "inputs": ["string", "string"],
  "platform_context": "string",
  "content_type": "string",
  "strictness": "string",
  "policy": "string"
}
```

**Response body:**
```json
{
  "total": 0,
  "flagged_count": 0,
  "flag_rate": 0.0,
  "results": []
}
```

---

## 11. Frontend Requirements

### 11.1 Layout

Two-panel desktop layout:

- **Left panel (40%):** All inputs
- **Right panel (60%):** All results

Collapses to single column on mobile (desktop-first, mobile-supported).

### 11.2 Input Panel

- Large textarea for content input (min 3 lines, max 500 characters with counter)
- Dropdown: Platform Context
- Dropdown: Content Type
- Dropdown: Strictness Level
- Dropdown: Platform Policy
- Conditional textarea: Custom Policy (visible only when Custom is selected)
- Primary CTA button: "Analyze"
- Secondary button: "Batch Upload" (CSV, optional feature)

### 11.3 Results Panel

- **Comparison Table:** One row per model. Columns: Model, Top Category, Severity, Confidence, Action, Policy Alignment
- **Disagreement Alert Banner:** Conditionally shown, described in plain English
- **Insights Strip:** Strictest model, most lenient model, consensus action
- **Explainability Panel:** Collapsible, one section per model

### 11.4 Design Guidelines

- Dark theme preferred (consistent with existing portfolio aesthetic)
- Action badges color-coded: Allow = green, Review = amber, Remove = red
- Alignment badges: Aligned = green, Misaligned = red
- No heavy frameworks — plain HTML/CSS/JS or lightweight React

---

## 12. Folder Structure

```
modeval/
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── routes/
│   │   ├── analyze.py          # POST /analyze handler
│   │   └── batch.py            # POST /batch-analyze handler
│   ├── models/
│   │   ├── perspective.py      # Perspective API integration
│   │   ├── openai_mod.py       # OpenAI Moderation API integration
│   │   └── hf_toxic_bert.py    # HuggingFace toxic-bert integration
│   ├── engine/
│   │   ├── normalizer.py       # Output normalization logic
│   │   ├── context_engine.py   # Threshold adjustment logic
│   │   ├── policy_engine.py    # Policy alignment scoring
│   │   ├── comparison.py       # Disagreement detection
│   │   └── explainer.py        # Explainability text generation
│   ├── config.py               # API keys, constants
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env                        # API keys (never committed)
├── .gitignore
└── README.md
```

---

## 13. Deployment

### 13.1 Platform
**Render (render.com)** — free tier supports Python/Flask backends. No credit card required to start.

### 13.2 Services
- **Backend:** Render Web Service (Python, Flask)
- **Frontend:** Render Static Site or served directly from Flask

### 13.3 Domain
- Register domain via Namecheap or Porkbun (~$10–15/year)
- Recommended names: `modeval.io`, `modeval.app`, `trymodeval.com`
- Connect custom domain via Render's domain settings panel
- HTTPS provisioned automatically via Let's Encrypt

### 13.4 Environment Variables
Store all API keys as environment variables in Render's dashboard. Never hardcode or commit keys.

| Variable | Description |
|---|---|
| `PERSPECTIVE_API_KEY` | Google Cloud API key for Perspective |
| `OPENAI_API_KEY` | OpenAI account API key |
| `HF_API_KEY` | HuggingFace Inference API token |

---

## 14. Success Criteria

| Criteria | Definition |
|---|---|
| Multi-model evaluation | All three APIs return results for a given input |
| Normalization | All outputs conform to the unified schema |
| Context adjustment | Changing platform/strictness visibly changes actions |
| Policy alignment | Alignment scores differ across platform policy selections |
| Disagreement detection | Conflicting results are flagged and explained |
| Live deployment | Tool is publicly accessible via custom domain |
| Explainability | Each result includes a human-readable explanation |

---

## 15. Future Improvements

- **Human vs AI comparison:** Allow a human moderator to submit their own decision and compare it against model outputs
- **Prompt injection testing:** Test whether policy instructions can be overridden via adversarial input
- **Red team mode:** Structured input library of known edge cases for systematic model evaluation
- **Export:** Download results as CSV or PDF
- **History log:** Store past analyses (with user consent) for trend analysis
- **Model leaderboard:** Aggregate alignment scores across all analyses to rank model performance by platform

---

## 16. Positioning Statement

ModEval is a context-aware, policy-aligned AI moderation evaluation platform built to expose how leading moderation models agree, disagree, and fail under real-world Trust & Safety conditions. It demonstrates applied knowledge of AI safety systems, platform policy design, output normalization, and the operational complexity of deploying moderation at scale.
