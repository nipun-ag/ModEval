"""Route handler for batch moderation analysis."""

from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.routes.analyze import build_response, validate_payload


batch_bp = Blueprint("batch", __name__)


def build_item_error_analysis(error_message: str) -> dict:
    """Create a batch-safe error payload for one invalid text input."""
    return {
        "error": error_message,
        "results": [],
        "disagreements": {
            "action_mismatch": [],
            "category_mismatch": [],
        },
        "insights": {
            "strictest_model": {
                "model": "Unavailable",
                "action": "Unavailable",
                "reason": "No valid model results were available.",
            },
            "most_lenient_model": {
                "model": "Unavailable",
                "action": "Unavailable",
                "reason": "No valid model results were available.",
            },
            "consensus_recommendation": "No Consensus",
        },
        "ai_analysis": {},
    }


@batch_bp.route("/batch-analyze", methods=["POST"])
def batch_analyze():
    """Analyze multiple inputs and return aggregate stats."""
    payload = request.get_json(silent=True) or {}
    texts = payload.get("texts")
    if texts is None:
        texts = payload.get("inputs")

    if not isinstance(texts, list) or not texts:
        return jsonify({"error": "A non-empty texts array is required."}), 400

    results = []
    flagged_count = 0

    for text in texts:
        text_value = str(text)
        item_payload = dict(payload)
        item_payload["text"] = text_value
        is_valid, message = validate_payload(item_payload)
        if not is_valid:
            results.append({"text": text_value, "analysis": build_item_error_analysis(message)})
            continue

        analysis = build_response(item_payload)
        if any(result.get("flagged") for result in analysis["results"]):
            flagged_count += 1
        results.append({"text": text_value, "analysis": analysis})

    total = len(texts)
    return jsonify(
        {
            "total": total,
            "flagged_count": flagged_count,
            "flag_rate": round(flagged_count / total, 4),
            "results": results,
        }
    )
