"""Route handler for batch moderation analysis."""

from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.routes.analyze import build_response


batch_bp = Blueprint("batch", __name__)


@batch_bp.route("/batch-analyze", methods=["POST"])
def batch_analyze():
    """Analyze multiple inputs and return aggregate stats."""
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or []

    if not isinstance(inputs, list) or not inputs:
        return jsonify({"error": "A non-empty inputs array is required."}), 400

    results = []
    flagged_count = 0

    for text in inputs:
        item_payload = dict(payload)
        item_payload["text"] = str(text)
        analysis = build_response(item_payload)
        if any(result.get("flagged") for result in analysis["results"]):
            flagged_count += 1
        results.append({"input": text, **analysis})

    total = len(inputs)
    return jsonify(
        {
            "total": total,
            "flagged_count": flagged_count,
            "flag_rate": round(flagged_count / total, 4),
            "results": results,
        }
    )
