"""Google NLP Content Moderation API wrapper."""

from __future__ import annotations

import os
import requests
from backend.config import REQUEST_TIMEOUT


def analyze(text: str) -> dict:
    """Analyze text using Google NLP moderateText endpoint."""
    api_key = os.getenv("GOOGLE_NLP_KEY", "").strip()

    if not api_key:
        return {
            "model": "Google NLP",
            "disabled": True,
            "scores": {},
        }

    url = f"https://language.googleapis.com/v1/documents:moderateText?key={api_key}"

    payload = {
        "document": {
            "type": "PLAIN_TEXT",
            "content": text,
        }
    }

    try:
        response = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        scores = {}
        category_map = {
            "Toxic": "toxicity",
            "Insult": "insult",
            "Profanity": "profanity",
            "Derogatory": "hate",
            "Sexual": "sexual",
            "Death, Harm & Tragedy": "violence",
            "Illicit Drugs": "illicit_drugs",
            "Firearms & Weapons": "weapons",
        }

        if "moderationCategories" in data:
            for category in data["moderationCategories"]:
                cat_name = category.get("name", "")
                confidence = category.get("confidence", 0.0)

                if cat_name in category_map:
                    scores[category_map[cat_name]] = confidence

        return {
            "model": "Google NLP",
            "scores": scores,
        }
    except Exception as e:
        raise Exception(f"Google NLP error: {str(e)}")
