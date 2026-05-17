"""The Hive AI V3 Text Moderation API wrapper for content moderation."""

from __future__ import annotations

import os
import requests
from backend.config import REQUEST_TIMEOUT


MODERATION_CLASSES = {
    "sexual",
    "hate",
    "violence",
    "bullying",
    "spam",
    "drugs",
    "weapons",
    "self_harm",
}

CLASS_NAME_MAPPINGS = {
    "violent_description": "violence",
    "sexual_description": "sexual",
}


def analyze(text: str) -> dict:
    """Analyze text using The Hive AI V3 Text Moderation API."""
    api_key = os.environ.get("HIVE_API_KEY", "").strip()

    if not api_key:
        return {
            "model": "Hive Moderation",
            "disabled": True,
            "scores": {},
        }

    url = "https://api.thehive.ai/api/v3/hive/text-moderation"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "input": [
            {"text": text}
        ]
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        scores = {}
        if "output" in data and len(data["output"]) > 0:
            output = data["output"][0]
            if "classes" in output:
                for class_item in output["classes"]:
                    class_name = class_item.get("class", "").lower()
                    value = class_item.get("value", -1)

                    # Skip unsupported language marker
                    if value == -1:
                        continue

                    # Map API class names to canonical names
                    canonical_name = CLASS_NAME_MAPPINGS.get(class_name, class_name)

                    # Only include moderation-relevant classes
                    if canonical_name in MODERATION_CLASSES:
                        # Normalize 0-3 integer score to 0.0-1.0 float
                        normalized_score = float(value) / 3.0
                        scores[canonical_name] = normalized_score

        return {
            "model": "Hive Moderation",
            "scores": scores,
        }
    except Exception as e:
        raise Exception(f"Hive Moderation error: {str(e)}")
