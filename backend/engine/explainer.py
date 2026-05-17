"""Generate plain-language explanations for each normalized model result."""

from __future__ import annotations


def build_context_summary(
    platform_context: str, content_type: str, strictness: str, thresholds: dict
) -> str:
    """Explain the active thresholds (now fixed; platform judgment handled by Claude Haiku)."""
    return (
        f"Fixed thresholds in use: Review at {thresholds['review_threshold']:.2f}, "
        f"Remove at {thresholds['remove_threshold']:.2f}. "
        f"Platform-specific policy judgment is handled by the alignment assessment."
    )


def explain_result(
    result: dict,
    platform_context: str,
    content_type: str,
    strictness: str,
    thresholds: dict,
    policy_note: str,
) -> str:
    """Build the explainability text shown in the UI."""
    notable_categories = [
        f"{category} ({score:.2f})"
        for category, score in sorted(result.get("raw_scores", {}).items(), key=lambda item: item[1], reverse=True)
        if score >= 0.30
    ]

    top_line = (
        f"Top category: {result['top_category']} at {result['confidence']:.2f}. "
        f"Recommended action: {result['action']}."
    )

    if result.get("error"):
        return f"{top_line} Model error: {result['error']}"

    category_line = (
        "Categories above 0.30: " + ", ".join(notable_categories) + "."
        if notable_categories
        else "No categories crossed the 0.30 explainability threshold."
    )

    context_line = build_context_summary(platform_context, content_type, strictness, thresholds)

    return f"{top_line} {category_line} {context_line} Policy note: {policy_note}"
