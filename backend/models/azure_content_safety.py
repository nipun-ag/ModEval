"""Azure Content Safety API wrapper for content moderation."""

from __future__ import annotations

import os
import requests

from backend.config import REQUEST_TIMEOUT


CATEGORY_MAPPINGS = {
    "Hate": "hate",
    "Violence": "violence",
    "Sexual": "sexual",
    "SelfHarm": "self_harm",
}


def analyze(text: str) -> dict:
    """Analyze text using Azure Content Safety API."""
    api_key = os.environ.get("AZURE_CS_KEY", "").strip()
    endpoint = os.environ.get("AZURE_CS_ENDPOINT", "").strip()

    if not api_key or not endpoint:
        return {
            "model": "Azure Content Safety",
            "disabled": True,
            "scores": {},
        }

    url = f"{endpoint}contentsafety/text:analyze?api-version=2023-10-01"
    headers = {
        "Ocp-Apim-Subscription-Key": api_key,
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "categories": ["Hate", "Violence", "Sexual", "SelfHarm"],
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        scores = {}
        if "categoriesAnalysis" in data:
            for category_analysis in data["categoriesAnalysis"]:
                api_category = category_analysis.get("category", "")
                severity = category_analysis.get("severity", 0)

                # Map API category name to canonical name
                canonical_name = CATEGORY_MAPPINGS.get(api_category)
                if canonical_name:
                    # Normalize 0-6 severity to 0.0-1.0 float
                    normalized_score = float(severity) / 6.0
                    scores[canonical_name] = normalized_score

        return {
            "model": "Azure Content Safety",
            "scores": scores,
        }
    except Exception as e:
        raise Exception(f"Azure Content Safety error: {str(e)}")
