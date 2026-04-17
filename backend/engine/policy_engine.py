"""Policy evaluation, alignment scoring, and custom policy parsing."""

from __future__ import annotations

from backend.config import CUSTOM_POLICY_KEYWORDS, PREDEFINED_POLICIES


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


def get_policy_rules(policy_name: str, custom_policy_text: str = "") -> dict:
    """Return policy rules for a predefined or custom policy selection."""
    if policy_name == "Custom":
        return summarize_custom_policy(custom_policy_text)

    policy = PREDEFINED_POLICIES.get(policy_name, {})
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
