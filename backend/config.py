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

load_dotenv(PROJECT_ROOT / ".env")


PERSPECTIVE_API_KEY = os.getenv("PERSPECTIVE_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
HF_API_KEY = os.getenv("HF_API_KEY", "").strip()


REQUEST_TIMEOUT = 20
MAX_INPUT_LENGTH = 500


BASE_REVIEW_THRESHOLD = 0.40
BASE_REMOVE_THRESHOLD = 0.70
MIN_THRESHOLD = 0.10
MAX_THRESHOLD = 0.90


PLATFORM_MODIFIERS = {
    "Gaming": -0.10,
    "Social Media": 0.00,
    "Professional": 0.15,
    "Forum": -0.05,
    "VR/Metaverse": -0.15,
}

CONTENT_TYPE_MODIFIERS = {
    "Original Post": 0.00,
    "Comment/Reply": -0.05,
    "Username": 0.20,
    "Bio": 0.15,
    "UGC": -0.05,
}

STRICTNESS_MODIFIERS = {
    "Strict": 0.15,
    "Balanced": 0.00,
    "Lenient": -0.15,
}


PREDEFINED_POLICIES = {
    "Reddit": {
        "zero_tolerance": {"violence", "self-harm", "sexual/minors"},
        "deprioritized": {"profanity", "insult"},
    },
    "Discord": {
        "zero_tolerance": {"harassment/threatening", "sexual/minors", "hate"},
        "deprioritized": {"profanity"},
    },
    "Facebook": {
        "zero_tolerance": {"hate", "violence", "sexual", "self-harm"},
        "deprioritized": set(),
    },
    "Instagram": {
        "zero_tolerance": {"sexual/minors", "harassment", "identity_attack"},
        "deprioritized": {"profanity", "insult"},
    },
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
