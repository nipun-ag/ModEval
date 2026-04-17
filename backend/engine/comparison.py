"""Comparison helpers for the current three-model HuggingFace lineup."""

from __future__ import annotations


ACTION_RANK = {"Allow": 0, "Review": 1, "Remove": 2}


def detect_disagreements(results: list[dict]) -> list[dict]:
    """Find action/category/severity disagreements across model outputs."""
    disagreements = []
    valid_results = [result for result in results if not result.get("error")]

    if len({result["action"] for result in valid_results}) > 1:
        action_snapshot = ", ".join(
            f"{result['model']} recommends {result['action']}" for result in valid_results
        )
        disagreements.append(
            {
                "type": "Action Mismatch",
                "description": f"Models disagree on the final action: {action_snapshot}.",
            }
        )

    if len({result["top_category"] for result in valid_results}) > 1:
        category_snapshot = ", ".join(
            f"{result['model']} flagged {result['top_category']}" for result in valid_results
        )
        disagreements.append(
            {
                "type": "Category Mismatch",
                "description": f"Models surfaced different top categories: {category_snapshot}.",
            }
        )

    if valid_results:
        max_result = max(valid_results, key=lambda item: item["severity"])
        min_result = min(valid_results, key=lambda item: item["severity"])
        severity_gap = max_result["severity"] - min_result["severity"]
        if severity_gap >= 3:
            disagreements.append(
                {
                    "type": "Severity Gap",
                    "description": (
                        f"{max_result['model']} scored severity {max_result['severity']} while "
                        f"{min_result['model']} scored {min_result['severity']}."
                    ),
                }
            )

    return disagreements


def build_insights(results: list[dict]) -> dict:
    """Summarize overall model posture for the UI insights strip."""
    valid_results = [result for result in results if not result.get("error")]
    if not valid_results:
        return {
            "strictest_model": "Unavailable",
            "most_lenient_model": "Unavailable",
            "consensus_action": "No Consensus",
            "summary": "No model results were available.",
        }

    strictest = max(valid_results, key=lambda item: (ACTION_RANK[item["action"]], item["confidence"]))
    lenient = min(valid_results, key=lambda item: (ACTION_RANK[item["action"]], item["confidence"]))
    actions = {result["action"] for result in valid_results}
    consensus_action = valid_results[0]["action"] if len(actions) == 1 else "No Consensus"

    summary = (
        f"{strictest['model']} was the strictest while {lenient['model']} was the most lenient. "
        f"Consensus action: {consensus_action}."
    )

    return {
        "strictest_model": strictest["model"],
        "most_lenient_model": lenient["model"],
        "consensus_action": consensus_action,
        "summary": summary,
    }
