"""Route handler for single-input moderation analysis."""

from __future__ import annotations

import os
import openai
from concurrent.futures import ThreadPoolExecutor, as_completed

from flask import Blueprint, jsonify, request

from backend.config import MAX_INPUT_LENGTH, PLATFORM_MAP
from backend.engine.comparison import build_insights, detect_disagreements
from backend.engine.context_engine import calculate_context_adjustment
from backend.engine.explainer import explain_result
from backend.engine.normalizer import build_error_result, normalize_result
from backend.engine.policy_engine import evaluate_alignment_with_ai, evaluate_policy_alignment, get_policy_rules
from backend.models import (
    hf_bias,
    hf_hate_speech,
    hf_roberta_offensive,
    hf_toxic_bert,
    openai_moderation,
    hive_moderation,
    azure_content_safety,
    google_nlp,
)

analyze_bp = Blueprint("analyze", __name__)


MODEL_RUNNERS = {
    "Hive Moderation": hive_moderation.analyze,
    "Azure Content Safety": azure_content_safety.analyze,
    "Google NLP": google_nlp.analyze,
    "OpenAI Moderation": openai_moderation.analyze,
    "HuggingFace toxic-bert": hf_toxic_bert.analyze,
    "HuggingFace RoBERTa offensive": hf_roberta_offensive.analyze,
    "HuggingFace Hate Speech": hf_hate_speech.analyze,
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


def generate_ai_analysis(results: list[dict], context: dict) -> dict:
    """Generate structured AI analysis of model results using GPT-4o-mini."""
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        model_lines = []
        for r in results:
            if not r.get("error") and not r.get("disabled"):
                model_lines.append(
                    f"- {r['model']}: action={r.get('action','?')}, "
                    f"top_category={r.get('top_category','?')}, "
                    f"confidence={r.get('confidence','?')}, "
                    f"severity={r.get('severity','?')}"
                )

        models_text = "\n".join(model_lines)
        platform = context.get("platform", "Reddit")
        content_type = context.get("content_type", "Original Post")
        strictness = context.get("strictness", "Balanced")

        prompt = f"""You are a Trust & Safety analyst reviewing AI moderation results.

Platform: {platform}
Content type: {content_type}
Strictness: {strictness}

Model results:
{models_text}

Return ONLY a valid JSON object with exactly these 4 fields:

{{
  "disagreement_explanation": "1-2 sentences explaining WHY the models disagreed in plain English. Focus on what caused the split -- different training data, category interpretation, confidence levels. If models agreed, say so briefly.",
  "risk_narrative": "1 sentence summarizing the overall safety picture for this content on this platform.",
  "context_sensitivity": "1 sentence on how the platform type or strictness setting meaningfully affected the outcome. Be specific.",
  "contested_category": "The single violation category most models disagreed about (e.g. harassment, toxicity, hate). Just the category name, no explanation."
}}

Return ONLY the JSON object. No preamble, no markdown, no explanation."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3,
        )

        raw = response.choices[0].message.content.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        import json
        parsed = json.loads(raw)
        print(f"AI Analysis generated successfully")
        return parsed

    except Exception as e:
        print(f"AI Analysis failed: {e}")
        return {}


def build_response(payload: dict) -> dict:
    """Build the full API response for one text input."""
    platform = payload.get("platform", "Reddit")
    platform_config = PLATFORM_MAP.get(platform, PLATFORM_MAP.get("Reddit", {}))
    policy_key = platform_config.get("policy_key", "reddit")

    thresholds = calculate_context_adjustment(
        platform,
        payload.get("content_type", "Original Post"),
        payload.get("strictness", "Balanced"),
    )
    policy_rules = get_policy_rules(
        policy_key,
        payload.get("custom_policy_text", ""),
    )

    normalized_results = []
    for raw_result in run_models(payload["text"]):
        if raw_result.get("error"):
            result = build_error_result(raw_result["model"], raw_result["error"])
            result["explanation"] = explain_result(
                result,
                platform,
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

        if result.get("disabled"):
            normalized_results.append(result)
            continue

        result["explanation"] = explain_result(
            result,
            platform,
            payload.get("content_type", "Original Post"),
            payload.get("strictness", "Balanced"),
            thresholds,
            "Alignment evaluation pending.",
        )
        normalized_results.append(result)

    active_results = [
        result for result in normalized_results
        if not result.get("disabled") and not result.get("error")
    ]

    ai_alignment_map = evaluate_alignment_with_ai(
        active_results,
        platform,
        payload.get("custom_policy_text", ""),
    )

    if ai_alignment_map:
        for result in active_results:
            model_name = result.get("model", "")
            if model_name in ai_alignment_map:
                alignment_data = ai_alignment_map[model_name]
                result["alignment_score"] = alignment_data.get("alignment_score", 0.0)
                result["aligned"] = alignment_data.get("aligned", False)
                result["alignment_reason"] = alignment_data.get("alignment_reason", "")
    else:
        for result in active_results:
            policy_data = evaluate_policy_alignment(result, policy_rules, thresholds)
            result["alignment_score"] = policy_data["alignment_score"]
            result["aligned"] = policy_data["aligned"]
            result["alignment_reason"] = policy_data.get("policy_note", "")

    for result in normalized_results:
        result["flagged"] = result.get("action", "Allow") != "Allow"

    ai_analysis = generate_ai_analysis(active_results, {
        "platform": platform,
        "content_type": payload.get("content_type", "Original Post"),
        "strictness": payload.get("strictness", "Balanced"),
    })

    return {
        "results": normalized_results,
        "disagreements": detect_disagreements(active_results),
        "insights": build_insights(active_results),
        "ai_analysis": ai_analysis,
    }


@analyze_bp.route("/analyze", methods=["POST"])
def analyze_text():
    """Analyze one input string across all moderation providers."""
    payload = request.get_json(silent=True) or {}
    is_valid, message = validate_payload(payload)
    if not is_valid:
        return jsonify({"error": message}), 400

    return jsonify(build_response(payload))
