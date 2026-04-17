"""Perspective API integration."""

from __future__ import annotations

import requests

from backend.config import PERSPECTIVE_API_KEY, REQUEST_TIMEOUT


PERSPECTIVE_URL = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze"
PERSPECTIVE_ATTRIBUTES = [
    "TOXICITY",
    "SEVERE_TOXICITY",
    "INSULT",
    "THREAT",
    "PROFANITY",
    "IDENTITY_ATTACK",
    "SEXUALLY_EXPLICIT",
]


def analyze(text: str) -> dict:
    """Return raw Perspective scores in a consistent local shape."""
    if not PERSPECTIVE_API_KEY:
        raise RuntimeError("Perspective API key is missing.")

    payload = {
        "comment": {"text": text},
        "languages": ["en"],
        "requestedAttributes": {attribute: {} for attribute in PERSPECTIVE_ATTRIBUTES},
    }

    response = requests.post(
        f"{PERSPECTIVE_URL}?key={PERSPECTIVE_API_KEY}",
        json=payload,
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()

    scores = {}
    for attribute, value in data.get("attributeScores", {}).items():
        summary = value.get("summaryScore", {})
        scores[attribute.lower()] = float(summary.get("value", 0.0))

    return {
        "model": "Perspective API",
        "scores": scores,
        "raw_response": data,
    }
