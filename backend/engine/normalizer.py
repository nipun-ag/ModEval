"""Normalization helpers for converting raw model outputs into one schema."""

from __future__ import annotations

from backend.engine.context_engine import determine_action


CATEGORY_ALIASES = {
    "toxicity": "toxicity",
    "toxic": "toxicity",
    "spam": "spam",
    "ham": "allow",
    "biased": "bias",
    "bias": "bias",
    "offensive": "harassment",
    "offensive_language": "harassment",
    "offensive content": "harassment",
    "hate": "hate",
    "hateful": "hate",
    "hate_speech": "hate",
    "non_hate": "allow",
    "nothate": "allow",
    "normal": "allow",
    "neutral": "allow",
    "severe_toxicity": "severe_toxicity",
    "severe_toxic": "severe_toxicity",
    "obscene": "profanity",
    "profanity": "profanity",
    "insult": "insult",
    "threat": "threat",
    "identity_attack": "identity_attack",
    "identity_hate": "identity_attack",
    "hate": "hate",
    "hate/threatening": "hate/threatening",
    "harassment": "harassment",
    "harassment/threatening": "harassment/threatening",
    "sexual": "sexual",
    "sexual/minors": "sexual/minors",
    "sexually_explicit": "sexual",
    "violence": "violence",
    "violence/graphic": "violence/graphic",
    "self-harm": "self-harm",
    "self-harm/intent": "self-harm/intent",
    "self-harm/instructions": "self-harm/instructions",
    "label_0": "allow",
    "label_1": "harassment",
    "label_2": "hate",
}


def normalize_scores(raw_scores: dict) -> dict:
    """Map provider-specific score keys into the shared category namespace."""
    normalized = {}
    for category, score in raw_scores.items():
        key = category.lower()
        if key == "label_1" and "label_0" in {item.lower() for item in raw_scores}:
            canonical_name = "spam"
        else:
            canonical_name = CATEGORY_ALIASES.get(key, key)
        if canonical_name == "allow":
            continue
        normalized[canonical_name] = max(float(score), normalized.get(canonical_name, 0.0))
    return normalized


def score_to_severity(score: float) -> int:
    """Scale a 0-1 score into the 1-10 severity range from the spec."""
    return min(10, max(1, round(score * 10)))


def normalize_result(raw_result: dict, thresholds: dict) -> dict:
    """Convert one raw provider response into the unified ModEval schema."""
    raw_scores = normalize_scores(raw_result.get("scores", {}))

    if not raw_scores:
        top_category = "none"
        confidence = 0.0
    else:
        top_category, confidence = max(raw_scores.items(), key=lambda item: item[1])

    severity = score_to_severity(confidence)
    action, flagged = determine_action(confidence, thresholds)

    return {
        "model": raw_result.get("model", "Unknown Model"),
        "raw_scores": raw_scores,
        "top_category": top_category,
        "severity": severity,
        "confidence": round(confidence, 4),
        "action": action,
        "flagged": flagged,
    }


def build_error_result(model_name: str, error_message: str) -> dict:
    """Create a safe placeholder result when a provider call fails."""
    return {
        "model": model_name,
        "raw_scores": {},
        "top_category": "unavailable",
        "severity": 1,
        "confidence": 0.0,
        "action": "Review",
        "flagged": True,
        "error": error_message,
    }
