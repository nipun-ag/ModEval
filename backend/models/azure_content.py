"""Azure Content Safety API wrapper for content moderation."""

from __future__ import annotations

import os
import requests
from backend.config import REQUEST_TIMEOUT


def analyze(text: str) -> dict:
    """Analyze text using Azure Content Safety API."""
    api_key = os.getenv("AZURE_CS_KEY", "").strip()
    endpoint = os.getenv("AZURE_CS_ENDPOINT", "").strip()

    if not api_key or not endpoint:
        return {
            "model": "Azure Content Safety",
            "disabled": True,
            "scores": {},
        }

    url = f"{endpoint}/contentsafety/text:analyze?api-version=2023-10-01"
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
                category = category_analysis.get("category", "").lower()
                severity = category_analysis.get("severity", 0)
                confidence = severity / 6.0

                if category == "hate":
                    scores["hate"] = confidence
                elif category == "violence":
                    scores["violence"] = confidence
                elif category == "sexual":
                    scores["sexual"] = confidence
                elif category == "selfharm":
                    scores["self-harm"] = confidence

        return {
            "model": "Azure Content Safety",
            "scores": scores,
        }
    except Exception as e:
        raise Exception(f"Azure Content Safety error: {str(e)}")
