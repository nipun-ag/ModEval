"""OpenAI Moderation API integration."""

from __future__ import annotations

import requests

from backend.config import OPENAI_API_KEY, REQUEST_TIMEOUT


OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations"


def analyze(text: str) -> dict:
    """Return raw OpenAI moderation scores in a consistent local shape."""
    if not OPENAI_API_KEY:
        raise RuntimeError("OpenAI API key is missing.")

    response = requests.post(
        OPENAI_MODERATION_URL,
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={"input": text},
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    result = (data.get("results") or [{}])[0]

    category_scores = {
        category.lower(): float(score)
        for category, score in result.get("category_scores", {}).items()
    }

    return {
        "model": "OpenAI Moderation API",
        "scores": category_scores,
        "raw_response": result,
    }
