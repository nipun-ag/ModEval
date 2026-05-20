"""Central configuration for ModEval.

Loads API keys from the environment, defines shared constants, and keeps
normalization/context/policy settings in one place so the rest of the app
can stay focused on behavior.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

_env_path = PROJECT_ROOT / ".env"
if _env_path.exists():
    load_dotenv(_env_path)


HF_API_KEY = os.getenv("HF_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

HIVE_API_KEY = os.getenv("HIVE_API_KEY", "").strip()
AZURE_CS_KEY = os.getenv("AZURE_CS_KEY", "").strip()
AZURE_CS_ENDPOINT = os.getenv("AZURE_CS_ENDPOINT", "").strip()
GOOGLE_NLP_KEY = os.getenv("GOOGLE_NLP_KEY", "").strip()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

REQUEST_TIMEOUT = 20
MAX_INPUT_LENGTH = 500
MAX_BATCH_SIZE = 10


BASE_REVIEW_THRESHOLD = 0.40
BASE_REMOVE_THRESHOLD = 0.70


PREDEFINED_POLICIES = {
    "Reddit": {
        "zero_tolerance": {"violence", "self-harm", "sexual/minors", "hate"},
        "deprioritized": set(),
    },
    "Discord": {
        "zero_tolerance": {"sexual/minors", "harassment/threatening"},
        "deprioritized": {"profanity", "insult", "toxicity"},
    },
    "Facebook": {
        "zero_tolerance": {"hate", "violence", "sexual", "self-harm", "harassment"},
        "deprioritized": set(),
    },
    "Instagram": {
        "zero_tolerance": {"hate", "violence", "sexual", "self-harm", "harassment"},
        "deprioritized": set(),
    },
}


PLATFORM_MAP = {
    "Reddit": {"policy_key": "reddit"},
    "Discord": {"policy_key": "discord"},
    "Facebook": {"policy_key": "facebook"},
    "Instagram": {"policy_key": "instagram"},
    "Custom": {"policy_key": "custom"},
}


CUSTOM_POLICY_KEYWORDS = {
    "self-harm": {"self-harm", "suicide", "kill myself"},
    "violence": {"violence", "violent", "attack", "murder"},
    "sexual/minors": {"minor", "child sexual", "underage"},
    "sexual": {"sexual", "explicit", "nudity"},
    "hate": {"hate", "slur", "racist", "bigot"},
    "harassment": {"harass", "bully", "targeted abuse"},
    "profanity": {"profanity", "curse", "swearing"},
    "insult": {"insult", "name-calling"},
}
