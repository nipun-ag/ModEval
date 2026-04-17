"""HuggingFace Inference API integration for `facebook/roberta-hate-speech-dynabench-r4-target`."""

from __future__ import annotations

import requests

from backend.config import HF_API_KEY, REQUEST_TIMEOUT


HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/facebook/roberta-hate-speech-dynabench-r4-target"


def analyze(text: str) -> dict:
    """Return raw HuggingFace scores in a consistent local shape."""
    if not HF_API_KEY:
        raise RuntimeError("HuggingFace API key is missing.")

    response = requests.post(
        HF_MODEL_URL,
        headers={"Authorization": f"Bearer {HF_API_KEY}"},
        json={"inputs": text},
        timeout=REQUEST_TIMEOUT,
    )

    if response.status_code == 429:
        raise RuntimeError("HuggingFace Hate Speech is rate-limited right now.")

    response.raise_for_status()
    data = response.json()
    predictions = data[0] if isinstance(data, list) and data else []

    scores = {
        item["label"].lower(): float(item["score"])
        for item in predictions
        if isinstance(item, dict) and "label" in item
    }

    return {
        "model": "HuggingFace Hate Speech",
        "scores": scores,
        "raw_response": data,
    }
