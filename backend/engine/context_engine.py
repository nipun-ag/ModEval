"""Context-based threshold adjustment and action calculation."""

from __future__ import annotations

from backend.config import (
    BASE_REMOVE_THRESHOLD,
    BASE_REVIEW_THRESHOLD,
    CONTENT_TYPE_MODIFIERS,
    MAX_THRESHOLD,
    MIN_THRESHOLD,
    PLATFORM_MODIFIERS,
    STRICTNESS_MODIFIERS,
)


def clamp(value: float, minimum: float = MIN_THRESHOLD, maximum: float = MAX_THRESHOLD) -> float:
    """Clamp a numeric threshold into a safe moderation range."""
    return max(minimum, min(maximum, value))


def calculate_context_adjustment(
    platform_context: str, content_type: str, strictness: str
) -> dict:
    """Return threshold modifiers and final thresholds for the selected context."""
    platform_modifier = PLATFORM_MODIFIERS.get(platform_context, 0.0)
    content_modifier = CONTENT_TYPE_MODIFIERS.get(content_type, 0.0)
    strictness_modifier = STRICTNESS_MODIFIERS.get(strictness, 0.0)
    total_modifier = platform_modifier + content_modifier + strictness_modifier

    review_threshold = clamp(BASE_REVIEW_THRESHOLD + total_modifier)
    remove_threshold = clamp(BASE_REMOVE_THRESHOLD + total_modifier)

    if review_threshold >= remove_threshold:
        review_threshold = clamp(remove_threshold - 0.05)

    return {
        "platform_modifier": platform_modifier,
        "content_modifier": content_modifier,
        "strictness_modifier": strictness_modifier,
        "total_modifier": total_modifier,
        "review_threshold": round(review_threshold, 2),
        "remove_threshold": round(remove_threshold, 2),
    }


def determine_action(confidence: float, thresholds: dict) -> tuple[str, bool]:
    """Map the normalized confidence score to Allow, Review, or Remove."""
    if confidence >= thresholds["remove_threshold"]:
        return "Remove", True
    if confidence >= thresholds["review_threshold"]:
        return "Review", True
    return "Allow", False
