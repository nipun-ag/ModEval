"""Comparison helpers for the current eight-model moderation pipeline."""

from __future__ import annotations

from collections import Counter


ACTION_RANK = {"Allow": 0, "Review": 1, "Remove": 2}


def detect_disagreements(results: list[dict]) -> dict:
    """Find action/category/severity disagreements across model outputs."""
    valid_results = [result for result in results if not result.get("error")]
    disagreements = {
        "action_mismatch": [],
        "category_mismatch": [],
        "severity_gap": [],
    }

    if len({result["action"] for result in valid_results}) > 1:
        disagreements["action_mismatch"] = [result["model"] for result in valid_results]

    if len({result["top_category"] for result in valid_results}) > 1:
        disagreements["category_mismatch"] = [result["model"] for result in valid_results]

    if valid_results:
        max_result = max(valid_results, key=lambda item: item["severity"])
        min_result = min(valid_results, key=lambda item: item["severity"])
        severity_gap = max_result["severity"] - min_result["severity"]
        if severity_gap >= 3:
            disagreements["severity_gap"] = [max_result["model"], min_result["model"]]

    return disagreements


def build_insights(results: list[dict]) -> dict:
    """Summarize overall model posture for the UI insights strip."""
    valid_results = [result for result in results if not result.get("error")]
    if not valid_results:
        return {
            "strictest_model": {
                "model": "Unavailable",
                "action": "Unavailable",
                "reason": "No model results were available.",
            },
            "most_lenient_model": {
                "model": "Unavailable",
                "action": "Unavailable",
                "reason": "No model results were available.",
            },
            "consensus_recommendation": "No Consensus",
        }

    strictest = max(valid_results, key=lambda item: (ACTION_RANK[item["action"]], item["confidence"]))
    lenient = min(valid_results, key=lambda item: (ACTION_RANK[item["action"]], item["confidence"]))
    action_counts = Counter(result["action"] for result in valid_results)
    most_common = action_counts.most_common()
    consensus_action = (
        most_common[0][0]
        if len(most_common) == 1 or (len(most_common) > 1 and most_common[0][1] > most_common[1][1])
        else "No Consensus"
    )

    return {
        "strictest_model": {
            "model": strictest["model"],
            "action": strictest["action"],
            "reason": "Highest combined action severity after policy alignment.",
        },
        "most_lenient_model": {
            "model": lenient["model"],
            "action": lenient["action"],
            "reason": "Lowest combined action severity after policy alignment.",
        },
        "consensus_recommendation": consensus_action,
    }
