"""Context-based threshold adjustment and action calculation."""

from __future__ import annotations

from backend.config import (
    BASE_REMOVE_THRESHOLD,
    BASE_REVIEW_THRESHOLD,
)


def calculate_context_adjustment() -> dict:
    """Return fixed base thresholds independent of platform or content context.

    Platform-specific policy judgment is handled by Claude Haiku's alignment
    assessment, not by adjusting thresholds before that call.
    """
    return {
        "review_threshold": round(BASE_REVIEW_THRESHOLD, 2),
        "remove_threshold": round(BASE_REMOVE_THRESHOLD, 2),
    }


def determine_action(confidence: float, thresholds: dict) -> tuple[str, bool]:
    """Map the normalized confidence score to Allow, Review, or Remove."""
    if confidence >= thresholds["remove_threshold"]:
        return "Remove", True
    if confidence >= thresholds["review_threshold"]:
        return "Review", True
    return "Allow", False
