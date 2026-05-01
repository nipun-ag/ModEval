"""AWS Comprehend API wrapper for content moderation."""

from __future__ import annotations

import os


def analyze(text: str) -> dict:
    """Analyze text using AWS Comprehend."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()
    aws_region = os.getenv("AWS_REGION", "us-east-1").strip()

    if not aws_key or not aws_secret:
        return {
            "model": "AWS Comprehend",
            "disabled": True,
            "scores": {},
        }

    try:
        import boto3

        client = boto3.client(
            "comprehend",
            region_name=aws_region,
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret,
        )

        response = client.detect_toxic_content(
            TextSegments=[{"Text": text}],
            LanguageCode="en",
        )

        scores = {}
        if "ResultList" in response and len(response["ResultList"]) > 0:
            result = response["ResultList"][0]
            if "Labels" in result:
                for label in result["Labels"]:
                    label_name = label.get("Name", "").lower()
                    label_score = label.get("Score", 0.0)

                    if label_name == "graphic_violence":
                        scores["violence"] = label_score
                    elif label_name == "hate_speech":
                        scores["hate"] = label_score
                    elif label_name == "harassment":
                        scores["harassment"] = label_score
                    elif label_name == "sexual":
                        scores["sexual"] = label_score
                    elif label_name == "insult":
                        scores["insult"] = label_score
                    elif label_name == "profanity":
                        scores["profanity"] = label_score

        return {
            "model": "AWS Comprehend",
            "scores": scores,
        }
    except ImportError:
        raise Exception("AWS Comprehend error: boto3 not installed")
    except Exception as e:
        raise Exception(f"AWS Comprehend error: {str(e)}")
