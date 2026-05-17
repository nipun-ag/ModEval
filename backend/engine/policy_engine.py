"""Policy evaluation, alignment scoring, and custom policy parsing."""

from __future__ import annotations

import json
import os
import openai

from backend.config import CUSTOM_POLICY_KEYWORDS, PREDEFINED_POLICIES, PLATFORM_MAP


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
        "expected_threshold": round(expected_threshold, 2),
        "enforced_action": enforced_action,
    }


def get_platform_policy_summary(platform: str, custom_policy_text: str = "") -> str:
    """Return the policy summary for GPT-4o-mini alignment evaluation."""
    platform_policies = {
        "Reddit": "Zero tolerance for violence, self-harm, content sexualizing minors, and hate speech. Harassment and threatening content are also banned.",
        "Discord": "Zero tolerance for content sexualizing minors and direct threatening harassment. More lenient on profanity, general toxicity, and insults which are not bannable offenses.",
        "Facebook": "Zero tolerance for hate speech, violence, sexual content, self-harm, and harassment across all forms.",
        "Instagram": "Zero tolerance for hate speech, violence, sexual content, self-harm, and harassment across all forms.",
        "Gaming Platform": "Use general best-practice content moderation standards.",
        "Professional": "Use general best-practice content moderation standards.",
        "Community / Forum": "Use general best-practice content moderation standards.",
        "VR / Metaverse": "Use general best-practice content moderation standards.",
        "Custom": f"User-defined policy: {custom_policy_text}" if custom_policy_text else "Generic best-practice standards.",
    }
    return platform_policies.get(platform, "Use general best-practice content moderation standards.")


def evaluate_alignment_with_ai(results: list[dict], platform: str, custom_policy_text: str = "") -> dict:
    """Evaluate model alignment with platform policy using GPT-4o-mini in a single batched call."""
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        model_results_json = []
        for r in results:
            if not r.get("error") and not r.get("disabled"):
                model_results_json.append({
                    "model": r.get("model", ""),
                    "top_category": r.get("top_category", ""),
                    "confidence": float(r.get("confidence", 0.0)),
                    "action": r.get("action", ""),
                })

        if not model_results_json:
            return {}

        policy_summary = get_platform_policy_summary(platform, custom_policy_text)

        system_prompt = f"""You are a Trust & Safety policy expert. You will be given moderation results from multiple AI models analyzing a piece of content. For each model result, assess whether the recommended action aligns with the platform's content policy.

Platform Policy:
{policy_summary}

For each model, return ONLY a JSON array in this exact format:
[
  {{
    "model": "<model name>",
    "aligned": true/false,
    "alignment_score": <float 0.0-1.0>,
    "alignment_reason": "<one sentence>"
  }},
  ...
]
Return only the JSON array. No other text."""

        user_message = f"Model results to evaluate:\n{json.dumps(model_results_json, indent=2)}"

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=500,
            temperature=0.3,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        alignment_results = json.loads(raw)
        print(f"AI Alignment evaluation completed for {len(alignment_results)} models")

        alignment_map = {item["model"]: item for item in alignment_results}
        return alignment_map

    except Exception as e:
        print(f"AI Alignment evaluation failed: {e}")
        return {}
