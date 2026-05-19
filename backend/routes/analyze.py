"""Route handler for single-input moderation analysis."""

from __future__ import annotations

import json
import os
import anthropic
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
    """Generate structured AI analysis of model results using Claude Haiku.

    Note: ANTHROPIC_API_KEY must be added to Doppler (project: modeval, config: prd) for production.
    """
    try:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            print("AI Analysis skipped: ANTHROPIC_API_KEY is not set.")
            return {}
        client = anthropic.Anthropic(api_key=api_key)

        platform = context.get("platform", "Reddit")
        text = context.get("text", "")

        model_lines = []
        for r in results:
            if not r.get("error") and not r.get("disabled"):
                alignment_status = "ALIGNED" if r.get("aligned") else "MISALIGNED"
                model_lines.append(
                    f"- {r['model']}: confidence={r.get('confidence', 0.0):.2f}, "
                    f"top_category={r.get('top_category','?')}, "
                    f"policy_alignment={alignment_status}"
                )

        models_text = "\n".join(model_lines)

        system_prompt = """Do not use em dashes (—) anywhere in your response. Use commas, colons, or periods instead.

Do not use the words Allow, Review, or Remove anywhere in your response. Describe model behavior in terms of confidence scores and detection only. For example: instead of 'model X returned an Allow decision', say 'model X returned 0.00 confidence'. Instead of 'five models returned Remove', say 'five models returned high confidence (0.78-1.00)'.

You are a senior Trust & Safety analyst with expertise in content moderation. You will be given moderation results from multiple AI models analyzing a piece of content on a specific platform.

Your job is NOT to summarize what the models said. Your job is to read between the lines and provide genuine analytical insight.

Specifically you must:

1. Identify if this is a CLEAR VIOLATION, CLEAR SAFE, or GENUINE GREY AREA — and explain why in one sentence.

2. If models strongly disagree (e.g. one says ALLOW with low confidence while another says REMOVE with high confidence), call this out explicitly. Explain what the disagreement reveals about the content — is it ambiguous language? Missing context? A model limitation?

3. Remember that Allow/Review/Remove actions are assigned by ModEval's threshold system based on confidence score, not by the models themselves. A model returning 0.00 confidence means it detected nothing — evaluate whether that low detection is correct given the content, not whether the model 'decided' to allow it. Only flag a model failure if the confidence score itself is surprising given the content (e.g. 0.00 on clearly harmful text).

4. Give a concrete recommendation: should a human reviewer look at this? Is the platform policy clear enough to automate this decision, or does it require judgment?

5. If the content is a genuine grey area (could be interpreted multiple ways depending on context, intent, or platform), say so explicitly. Do not force a verdict on ambiguous content.

Keep your response to 3-4 sentences maximum per field. Be direct and specific. Do not use phrases like 'the models suggest' or 'analysis indicates'. Write like an experienced analyst giving a verbal briefing, not a report."""

        user_message = f"""Platform: {platform}

Original text:
"{text}"

Model results:
{models_text}

Provide your analytical interpretation in this JSON format:

{{
  "disagreement_explanation": "If models disagreed: what does the disagreement reveal? Is it ambiguous wording, missing context, or a model failure? If they agreed, say so briefly. 1-2 sentences.",
  "risk_narrative": "Your direct assessment of the content. Do NOT start with CLEAR VIOLATION, CLEAR SAFE, or GENUINE GREY AREA — the verdict label is shown separately in the UI. Start directly with your reasoning. If it is a grey area, be explicit about the ambiguity. 1-2 sentences.",
  "context_sensitivity": "Should a human reviewer look at this? Is the {platform} policy clear enough to automate, or does this require judgment? 1-2 sentences.",
  "contested_category": "Which category had the most disagreement or uncertainty among models? If none, state 'None'. Single category or 'None' only."
}}

Return ONLY the JSON object. No preamble, no markdown, no explanation."""

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )

        raw = response.content[0].text.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

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

    thresholds = calculate_context_adjustment()
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
        text=payload.get("text", ""),
        custom_policy_text=payload.get("custom_policy_text", ""),
    )

    if ai_alignment_map:
        for result in active_results:
            model_name = result.get("model", "")
            if model_name in ai_alignment_map:
                alignment_data = ai_alignment_map[model_name]
                result["aligned"] = alignment_data.get("aligned", False)
                result["alignment_reason"] = alignment_data.get("alignment_reason", "")
    else:
        for result in active_results:
            policy_data = evaluate_policy_alignment(result, policy_rules, thresholds)
            result["aligned"] = policy_data["aligned"]
            result["alignment_reason"] = policy_data.get("policy_note", "")

    for result in normalized_results:
        result["flagged"] = result.get("action", "Allow") != "Allow"

    ai_analysis = generate_ai_analysis(active_results, {
        "platform": platform,
        "content_type": payload.get("content_type", "Original Post"),
        "strictness": payload.get("strictness", "Balanced"),
        "text": payload.get("text", ""),
    })

    for result in normalized_results:
        result.pop("raw_scores", None)

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
