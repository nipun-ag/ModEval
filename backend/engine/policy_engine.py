"""Policy evaluation, alignment scoring, and custom policy parsing."""

from __future__ import annotations

import json
import logging
import re
import anthropic

from backend.config import ANTHROPIC_API_KEY, CUSTOM_POLICY_KEYWORDS, PREDEFINED_POLICIES, PLATFORM_MAP


def summarize_custom_policy(policy_text: str) -> dict:
    """Derive simple zero-tolerance and deprioritized rules from plain English."""
    text = (policy_text or "").lower()
    zero_tolerance = set()
    deprioritized = set()

    for category, keywords in CUSTOM_POLICY_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            if any(phrase in text for phrase in {"immediately", "auto-remove", "zero tolerance", "flag any"}):
                zero_tolerance.add(category)
            if any(phrase in text for phrase in {"allow", "unless directed", "deprioritize", "low priority"}):
                deprioritized.add(category)

    summary_bits = []
    if zero_tolerance:
        summary_bits.append(f"Zero tolerance for {', '.join(sorted(zero_tolerance))}.")
    if deprioritized:
        summary_bits.append(f"Lower priority for {', '.join(sorted(deprioritized))}.")
    if not summary_bits:
        summary_bits.append("Custom policy recorded; no direct category mapping was inferred.")

    return {
        "zero_tolerance": zero_tolerance,
        "deprioritized": deprioritized,
        "summary": " ".join(summary_bits),
    }


def get_policy_rules(policy_key: str, custom_policy_text: str = "") -> dict:
    """Return policy rules for a predefined or custom policy selection."""
    if policy_key == "custom":
        return summarize_custom_policy(custom_policy_text)

    if policy_key == "generic":
        return {
            "zero_tolerance": set(),
            "deprioritized": set(),
            "summary": "Generic policy (no alignment enforcement).",
        }

    policy_name = policy_key.capitalize()
    policy = PREDEFINED_POLICIES.get(policy_name, PREDEFINED_POLICIES.get("Reddit", {}))
    return {
        "zero_tolerance": set(policy.get("zero_tolerance", set())),
        "deprioritized": set(policy.get("deprioritized", set())),
        "summary": f"{policy_name} policy loaded.",
    }


def evaluate_policy_alignment(result: dict, policy_rules: dict, thresholds: dict) -> dict:
    """Measure how closely a model's result matches the selected policy."""
    top_category = result.get("top_category", "")
    confidence = float(result.get("confidence", 0.0))

    expected_threshold = thresholds["remove_threshold"]
    policy_note = "Matches the baseline platform policy."

    if top_category in policy_rules["zero_tolerance"]:
        expected_threshold = 0.10
        policy_note = f"{top_category} is zero tolerance under this policy."
    elif top_category in policy_rules["deprioritized"]:
        expected_threshold = min(0.90, thresholds["remove_threshold"] + 0.20)
        policy_note = f"{top_category} is deprioritized under this policy."
    elif policy_rules.get("summary"):
        policy_note = policy_rules["summary"]

    alignment_score = max(0.0, min(1.0, 1 - abs(confidence - expected_threshold)))
    aligned = alignment_score >= 0.70

    enforced_action = result["action"]
    if top_category in policy_rules["zero_tolerance"] and confidence > 0:
        enforced_action = "Remove"
    elif top_category in policy_rules["deprioritized"] and confidence < min(0.90, thresholds["remove_threshold"] + 0.20):
        enforced_action = "Allow" if confidence < thresholds["review_threshold"] else "Review"

    return {
        "alignment_score": round(alignment_score, 4),
        "aligned": aligned,
        "policy_note": policy_note,
    }


def get_platform_policy_summary(platform: str, custom_policy_text: str = "") -> str:
    """Return the policy summary for Claude Haiku alignment evaluation."""
    platform_policies = {
        "Reddit": """Reddit prohibits:
- Violence, threats, and content inciting harm against people
- Hate speech targeting protected groups based on identity
- Content sexualizing minors (zero tolerance)
- Self-harm promotion or glorification
- Harassment, bullying, and doxxing
- Spam, manipulation, vote manipulation, and ban evasion
- Impersonation and deceptive identity
- Fraud, scams, phishing, and illegal transactions
- Illegal content of any kind
Note: Reddit explicitly permits discussion of controversial topics, misinformation, and conspiracy theories unless they directly incite harm. Context and community rules matter.""",
        "Discord": """Discord prohibits:
- Content sexualizing minors (zero tolerance)
- Direct threats of real-world violence
- Non-consensual intimate imagery
- Coordinated harassment campaigns
- Hate speech targeting protected groups
- Phishing, malware, and financial scams
- Account compromise and unauthorized access
Note: Discord explicitly permits profanity, insults, general toxicity, and offensive language at the platform level. Server owners may set stricter local rules.""",
        "Facebook": """Facebook prohibits:
- Hate speech targeting protected characteristics
- Violence, threats, and incitement to harm
- Sexual content and nudity
- Self-harm promotion and eating disorder content
- Bullying, harassment, and targeted attacks
- Child sexual abuse material (zero tolerance)
- Spam, fraud, scams, and coordinated inauthentic behavior
- Impersonation and fake accounts
- Misinformation that causes real-world harm
- Privacy violations and doxxing
- Terrorist and extremist content""",
        "Instagram": """Instagram prohibits (unified with Facebook standards since November 2024):
- Hate speech targeting protected characteristics
- Violence, threats, and graphic content
- Sexual content and nudity
- Self-harm and eating disorder promotion
- Bullying, harassment, and targeted attacks
- Child sexual abuse material (zero tolerance)
- Spam, fraud, scams, and coordinated inauthentic behavior
- Impersonation and fake accounts
- Misinformation causing real-world harm
- Privacy violations and doxxing""",
        "Custom": f"User-defined policy: {custom_policy_text}" if custom_policy_text else "Apply general best-practice content moderation standards.",
    }
    return platform_policies.get(platform, "Use general best-practice content moderation standards.")


def evaluate_alignment_with_ai(results: list[dict], platform: str, text: str = "", custom_policy_text: str = "") -> dict:
    """Evaluate model alignment with platform policy using Claude Haiku in a single batched call.

    Note: ANTHROPIC_API_KEY must be added to Doppler (project: modeval, config: prd) for production.
    """
    try:
        if not ANTHROPIC_API_KEY:
            logging.warning("AI Alignment skipped: ANTHROPIC_API_KEY is not set.")
            return {}
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

        model_results_json = []
        for r in results:
            if not r.get("error") and not r.get("disabled"):
                model_results_json.append({
                    "model": r.get("model", ""),
                    "top_category": r.get("top_category", ""),
                    "confidence": float(r.get("confidence", 0.0)),
                    "system_action": r.get("action", ""),
                    "note": "system_action is assigned by threshold logic (confidence <0.40=Allow, 0.40-0.70=Review, >0.70=Remove), not by the model itself",
                })

        if not model_results_json:
            return {}

        policy_summary = get_platform_policy_summary(platform, custom_policy_text)

        system_prompt = f"""You are a Trust & Safety policy expert with deep knowledge of platform content policies. You will be given a piece of content and moderation results from multiple AI models.

Your job is to assess whether each model's recommended action aligns with the platform's actual content policy — not just whether the category name sounds bad, but whether THIS SPECIFIC CONTENT would actually violate the policy as written.

Platform: {platform}

Platform Policy:
{policy_summary}

Content being evaluated:
"{text}"

For each model result, answer this single question:
GIVEN WHAT THIS CONTENT ACTUALLY IS, is the model's final action (ALLOW/REVIEW/REMOVE) the correct decision under this platform's policy?

Rules for your assessment:
- The models return confidence scores only. The system_action field (Allow/Review/Remove) is assigned by ModEval's threshold logic, not by the model itself.
- First determine what the content actually is and whether it violates the platform policy. This is your ground truth.
- Then evaluate whether the model's confidence score is appropriate for this content. A high confidence score on safe content is wrong. A near-zero confidence score on clearly violating content means the model failed to detect the violation.
- A model is ALIGNED if its confidence score led to the correct system_action for this content under this platform's policy.
- A model is MISALIGNED if its confidence score was so wrong that the threshold system assigned an incorrect action.
- Do NOT say the model 'decided' to Allow or Remove. The model only produced a score. The system decided the action.
- If the content is genuinely ambiguous, mark the model as ALIGNED if its confidence score is reasonable, and note the ambiguity in the reason.

Return ONLY a JSON array in this exact format:
[
  {{
    "model": "<model name>",
    "aligned": true/false,
    "alignment_score": <float 0.0-1.0>,
    "alignment_reason": "<one sentence stating what the content actually is, whether it violates policy, and whether the model's action was correct or incorrect as a result>"
  }},
  ...
]
Return only the JSON array. No other text.

Do not use em dashes (—) in any part of your response. Use commas, colons, or periods instead."""

        user_message = f"Evaluate alignment for the model results above:\n{json.dumps(model_results_json, indent=2)}"

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1200,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
            timeout=25.0,
        )

        raw = response.content[0].text.strip()

        # Try to extract JSON array from anywhere in the response
        start = raw.find("[")
        end = raw.rfind("]")
        if start != -1 and end != -1 and end > start:
            raw = raw[start:end+1]
        raw = raw.strip()

        alignment_results = json.loads(raw)
        print(f"AI Alignment evaluation completed for {len(alignment_results)} models")

        alignment_map = {item["model"]: item for item in alignment_results}
        return alignment_map

    except Exception as e:
        logging.error(f"AI Alignment evaluation failed: {e}")
        return {}
