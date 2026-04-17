"""Route handler for single-input moderation analysis."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed

from flask import Blueprint, jsonify, request

from backend.config import MAX_INPUT_LENGTH
from backend.engine.comparison import build_insights, detect_disagreements
from backend.engine.context_engine import calculate_context_adjustment
from backend.engine.explainer import explain_result
from backend.engine.normalizer import build_error_result, normalize_result
from backend.engine.policy_engine import evaluate_policy_alignment, get_policy_rules
from backend.models import hf_bias, hf_hate_speech, hf_roberta_offensive, hf_spam, hf_toxic_bert


analyze_bp = Blueprint("analyze", __name__)


MODEL_RUNNERS = {
    "HuggingFace toxic-bert": hf_toxic_bert.analyze,
    "HuggingFace RoBERTa offensive": hf_roberta_offensive.analyze,
    "HuggingFace Hate Speech": hf_hate_speech.analyze,
    "HuggingFace Spam Detector": hf_spam.analyze,
    "HuggingFace Bias Detector": hf_bias.analyze,
}


def validate_payload(payload: dict) -> tuple[bool, str]:
    """Basic request validation for the analyze endpoint."""
    text = (payload.get("text") or "").strip()
    if not text:
        return False, "Text is required."
    if len(text) > MAX_INPUT_LENGTH:
        return False, f"Text must be {MAX_INPUT_LENGTH} characters or fewer."
    return True, ""


def run_models(text: str) -> list[dict]:
    """Execute model calls in parallel and capture per-model failures."""
    results = []

    with ThreadPoolExecutor(max_workers=len(MODEL_RUNNERS)) as executor:
        future_map = {
            executor.submit(runner, text): model_name
            for model_name, runner in MODEL_RUNNERS.items()
        }

        for future in as_completed(future_map):
            model_name = future_map[future]
            try:
                results.append(future.result())
            except Exception as exc:  # noqa: BLE001 - surface provider errors in the UI.
                results.append({"model": model_name, "error": str(exc), "scores": {}})

    order = list(MODEL_RUNNERS.keys())
    return sorted(results, key=lambda item: order.index(item["model"]))


def build_response(payload: dict) -> dict:
    """Build the full API response for one text input."""
    thresholds = calculate_context_adjustment(
        payload.get("platform_context", "Social Media"),
        payload.get("content_type", "Original Post"),
        payload.get("strictness", "Balanced"),
    )
    policy_rules = get_policy_rules(
        payload.get("policy", "Reddit"),
        payload.get("custom_policy_text", ""),
    )

    normalized_results = []
    for raw_result in run_models(payload["text"]):
        if raw_result.get("error"):
            result = build_error_result(raw_result["model"], raw_result["error"])
            result["explanation"] = explain_result(
                result,
                payload.get("platform_context", "Social Media"),
                payload.get("content_type", "Original Post"),
                payload.get("strictness", "Balanced"),
                thresholds,
                "Model output unavailable due to an integration error.",
            )
            result["alignment_score"] = 0.0
            result["aligned"] = False
            normalized_results.append(result)
            continue

        result = normalize_result(raw_result, thresholds)
        policy_data = evaluate_policy_alignment(result, policy_rules, thresholds)
        result["action"] = policy_data["enforced_action"]
        result["flagged"] = result["action"] != "Allow"
        result["alignment_score"] = policy_data["alignment_score"]
        result["aligned"] = policy_data["aligned"]
        result["explanation"] = explain_result(
            result,
            payload.get("platform_context", "Social Media"),
            payload.get("content_type", "Original Post"),
            payload.get("strictness", "Balanced"),
            thresholds,
            policy_data["policy_note"],
        )
        normalized_results.append(result)

    return {
        "results": normalized_results,
        "disagreements": detect_disagreements(normalized_results),
        "insights": build_insights(normalized_results),
    }


@analyze_bp.route("/analyze", methods=["POST"])
def analyze_text():
    """Analyze one input string across all moderation providers."""
    payload = request.get_json(silent=True) or {}
    is_valid, message = validate_payload(payload)
    if not is_valid:
        return jsonify({"error": message}), 400

    return jsonify(build_response(payload))
