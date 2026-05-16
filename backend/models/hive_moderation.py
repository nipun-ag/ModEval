"""The Hive AI Text Moderation API wrapper for content moderation."""

from __future__ import annotations

import os
import requests
from backend.config import REQUEST_TIMEOUT


def analyze(text: str) -> dict:
    """Analyze text using The Hive AI V3 Text Moderation API."""
    api_key = os.getenv("HIVE_API_KEY", "").strip()

    if not api_key:
        return {
            "model": "Hive Moderation",
            "disabled": True,
            "scores": {},
        }

    url = "https://api.thehive.ai/api/v2/task/sync"
    headers = {
        "Authorization": f"Bearer {api_key}",
    }

    payload = {
        "text_data": text,
    }

    try:
        response = requests.post(url, data=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        scores = {}
        if "status" in data:
            for status_item in data["status"]:
                if "response" in status_item:
                    response_obj = status_item["response"]
                    if "output" in response_obj:
                        for output_item in response_obj["output"]:
                            class_name = output_item.get("class", "").lower()
                            score = float(output_item.get("score", 0.0))
                            if class_name:
                                scores[class_name] = score

        return {
            "model": "Hive Moderation",
            "scores": scores,
        }
    except Exception as e:
        raise Exception(f"Hive Moderation error: {str(e)}")
