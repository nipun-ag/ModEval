"""Route handler for model status — credential-presence check only."""

from __future__ import annotations

from flask import Blueprint, jsonify

from backend.config import (
    HF_API_KEY,
    OPENAI_API_KEY,
    HIVE_API_KEY,
    AZURE_CS_KEY,
    AZURE_CS_ENDPOINT,
    GOOGLE_NLP_KEY,
)
from backend.routes.analyze import MODEL_RUNNERS

models_bp = Blueprint("models", __name__)


def is_model_active(model_name: str) -> bool:
    """Check whether the required credentials for one model are configured."""
    if model_name == "Hive Moderation":
        return bool(HIVE_API_KEY)
    if model_name == "Azure Content Safety":
        return bool(AZURE_CS_KEY and AZURE_CS_ENDPOINT)
    if model_name == "Google NLP":
        return bool(GOOGLE_NLP_KEY)
    if model_name == "OpenAI Moderation":
        return bool(OPENAI_API_KEY)
    return bool(HF_API_KEY)


@models_bp.get("/models")
def get_models():
    """Return active and total model counts without calling any model API."""
    model_names = list(MODEL_RUNNERS.keys())
    active_count = sum(1 for model_name in model_names if is_model_active(model_name))
    return jsonify({"active_count": active_count, "total_count": len(model_names)})
