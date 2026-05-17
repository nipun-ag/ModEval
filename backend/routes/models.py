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

models_bp = Blueprint("models", __name__)

_ACTIVE = [
    bool(HIVE_API_KEY),
    bool(AZURE_CS_KEY and AZURE_CS_ENDPOINT),
    bool(GOOGLE_NLP_KEY),
    bool(OPENAI_API_KEY),
    bool(HF_API_KEY),   # toxic-bert
    bool(HF_API_KEY),   # RoBERTa offensive
    bool(HF_API_KEY),   # Hate Speech
    bool(HF_API_KEY),   # Bias Detector
]

_TOTAL = len(_ACTIVE)


@models_bp.get("/models")
def get_models():
    """Return active and total model counts without calling any model API."""
    return jsonify({"active_count": sum(_ACTIVE), "total_count": _TOTAL})
