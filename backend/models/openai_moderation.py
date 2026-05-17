"""OpenAI Moderation API integration for omni-moderation-latest."""
from __future__ import annotations
import requests
from backend.config import OPENAI_API_KEY, REQUEST_TIMEOUT

OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations"

def analyze(text: str) -> dict:
    """Return OpenAI Moderation API scores in a consistent local shape."""
    if not OPENAI_API_KEY:
        return {
            "model": "OpenAI Moderation",
            "disabled": True,
            "action": "Disabled",
            "scores": {},
        }
    response = requests.post(
        OPENAI_MODERATION_URL,
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        json={"input": text, "model": "omni-moderation-latest"},
        timeout=REQUEST_TIMEOUT,
    )
    if response.status_code == 429:
        raise RuntimeError("OpenAI Moderation is rate-limited right now.")
    response.raise_for_status()
    data = response.json()
    results = data.get("results", [])
    if not results:
        raise RuntimeError("No moderation results returned from OpenAI.")
    result = results[0]
    scores = result.get("category_scores", {})
    return {
        "model": "OpenAI Moderation",
        "scores": scores,
        "raw_response": data,
    }
