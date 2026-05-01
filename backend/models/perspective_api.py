"""Google Perspective API wrapper for content moderation."""

from __future__ import annotations

import os
import requests
from backend.config import REQUEST_TIMEOUT


def analyze(text: str) -> dict:
    """Analyze text using Google Perspective API."""
    api_key = os.getenv("PERSPECTIVE_API_KEY", "").strip()

    if not api_key:
        return {
            "model": "Perspective API",
            "disabled": True,
            "scores": {},
        }

    url = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze"
    params = {"key": api_key}
    headers = {"Referer": "https://modeval.bynipun.com"}

    payload = {
        "comment": {"text": text},
        "requestedAttributes": {
            "TOXICITY": {},
            "SEVERE_TOXICITY": {},
            "IDENTITY_ATTACK": {},
            "INSULT": {},
            "THREAT": {},
            "SEXUALLY_EXPLICIT": {},
        },
        "languages": ["en"],
    }

    try:
        response = requests.post(url, json=payload, params=params, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        scores = {}
        if "attributeScores" in data:
            attr_scores = data["attributeScores"]
            if "TOXICITY" in attr_scores:
                scores["toxicity"] = attr_scores["TOXICITY"]["summaryScore"]["value"]
            if "SEVERE_TOXICITY" in attr_scores:
                scores["severe_toxicity"] = attr_scores["SEVERE_TOXICITY"]["summaryScore"]["value"]
            if "IDENTITY_ATTACK" in attr_scores:
                scores["identity_attack"] = attr_scores["IDENTITY_ATTACK"]["summaryScore"]["value"]
            if "INSULT" in attr_scores:
                scores["insult"] = attr_scores["INSULT"]["summaryScore"]["value"]
            if "THREAT" in attr_scores:
                scores["threat"] = attr_scores["THREAT"]["summaryScore"]["value"]
            if "SEXUALLY_EXPLICIT" in attr_scores:
                scores["sexual"] = attr_scores["SEXUALLY_EXPLICIT"]["summaryScore"]["value"]

        return {
            "model": "Perspective API",
            "scores": scores,
        }
    except Exception as e:
        raise Exception(f"Perspective API error: {str(e)}")
