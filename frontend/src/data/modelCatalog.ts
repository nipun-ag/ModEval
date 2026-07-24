export type ModelCatalogEntry = {
  id: string
  name: string
  arch: string
  creator: string
  detects: string
  trained: string
  strengths: string[]
  limitations: string[]
  link: string
  linkLabel: string
  tier: "enterprise" | "opensource"
}

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  {
    id: "Hive Moderation",
    name: "Hive Moderation",
    arch: "Proprietary",
    creator: "The Hive AI",
    detects: "Sexual, Violence, Hate, Bullying, Spam",
    trained: "Purpose-built for T&S pipelines",
    strengths: [
      "Purpose-built for T&S pipelines with multi-class text output",
      "V3 self-serve with instant API access and flexible pricing",
      "Covers 5 core violation categories in single API call",
    ],
    limitations: [
      "100 req/day on V3 free tier",
      "Severity levels rather than float confidence scores",
      "Limited to 1024 characters per request",
    ],
    link: "https://docs.thehive.ai/docs/text-moderation-api",
    linkLabel: "View Documentation →",
    tier: "enterprise",
  },
  {
    id: "Azure Content Safety",
    name: "Azure Content Safety",
    arch: "Proprietary",
    creator: "Microsoft Azure",
    detects: "Hate speech, violence, sexual content, self-harm",
    trained: "Microsoft proprietary enterprise dataset",
    strengths: [
      "Enterprise SLA and SOC2 compliance",
      "Designed specifically for production T&S pipelines",
      "Integrated with Azure ecosystem",
    ],
    limitations: [
      "Limited to 4 safety categories",
      "Severity scale (0-6) requires normalization to 0-1",
      "Paid service with per-request pricing",
    ],
    link: "https://azure.microsoft.com/services/cognitive-services/content-safety",
    linkLabel: "View Documentation →",
    tier: "enterprise",
  },
  {
    id: "Google NLP",
    name: "Google NLP",
    arch: "Proprietary",
    creator: "Google Cloud",
    detects: "8 moderation categories including weapons, drugs, and more",
    trained: "Google proprietary dataset",
    strengths: [
      "Broader category coverage (8 categories) including weapons and illicit drugs",
      "Integrates with Google Cloud ecosystem",
      "Proprietary training from Google's scale",
    ],
    limitations: [
      "Paid service requiring Google Cloud billing",
      "ModerateText endpoint is newer, less documented than core NLP features",
    ],
    link: "https://cloud.google.com/natural-language/docs",
    linkLabel: "View Documentation →",
    tier: "enterprise",
  },
  {
    id: "OpenAI Moderation",
    name: "OpenAI Moderation",
    arch: "Proprietary",
    creator: "OpenAI",
    detects:
      "Multi-category content violations across 13 safety dimensions including harassment, hate, violence, sexual content, and self-harm",
    trained: "Proprietary dataset curated by OpenAI",
    strengths: [
      "Industry-standard moderation API used in production at scale",
      "Covers 13 categories including illicit content and self-harm",
      "Continuously updated by OpenAI with latest safety research",
    ],
    limitations: [
      "Black box model with no public training data details",
      "Less granular explainability compared to open-source models",
    ],
    link: "https://platform.openai.com/docs/guides/moderation",
    linkLabel: "View on OpenAI →",
    tier: "enterprise",
  },
  {
    id: "HuggingFace toxic-bert",
    name: "toxic-bert",
    arch: "BERT",
    creator: "Unitary AI",
    detects: "General toxicity, insults, threats, obscene language and severe toxic content",
    trained: "Jigsaw Toxic Comment Classification dataset (Wikipedia comments)",
    strengths: [
      "Multi-label classification covering 6 toxicity dimensions simultaneously",
      "Best general-purpose toxicity baseline",
      "Widely used in production T&S pipelines",
    ],
    limitations: [
      "Trained on Wikipedia comments which skews toward formal English",
      "May underperform on informal social media slang",
    ],
    link: "https://huggingface.co/unitary/toxic-bert",
    linkLabel: "View on HuggingFace →",
    tier: "opensource",
  },
  {
    id: "HuggingFace RoBERTa offensive",
    name: "RoBERTa Offensive",
    arch: "RoBERTa",
    creator: "Cardiff NLP",
    detects: "Offensive and harassing language in social media context",
    trained: "Twitter data (SemEval 2019 OffComEval dataset)",
    strengths: [
      "Specifically trained on real social media content",
      "Better at detecting informal offensive language and slang than general toxicity models",
    ],
    limitations: [
      "Twitter-specific training may miss platform-specific offensive patterns from other networks",
    ],
    link: "https://huggingface.co/cardiffnlp/twitter-roberta-base-offensive",
    linkLabel: "View on HuggingFace →",
    tier: "opensource",
  },
  {
    id: "HuggingFace Hate Speech",
    name: "RoBERTa Hate Speech",
    arch: "RoBERTa",
    creator: "Facebook AI Research",
    detects: "Hate speech targeting protected groups and identity-based attacks",
    trained:
      "DynaBench R4 — an adversarially collected dataset designed to be harder to game than previous benchmarks",
    strengths: [
      "Trained on adversarially collected data making it more robust against evasion attempts",
      "Specifically targets identity-based hate rather than general toxicity",
    ],
    limitations: [
      "Binary hate/not-hate output provides less granularity than multi-label models",
    ],
    link: "https://huggingface.co/facebook/roberta-hate-speech-dynabench-r4-target",
    linkLabel: "View on HuggingFace →",
    tier: "opensource",
  },
  {
    id: "HuggingFace Bias Detector",
    name: "DistilRoBERTa Bias",
    arch: "DistilRoBERTa",
    creator: "Valurank",
    detects: "Biased and non-neutral language in text",
    trained:
      "Wikipedia revision history (WNC corpus) — edits where neutral editors removed biased language",
    strengths: [
      "Unique training methodology using real editorial decisions",
      "Detects subtle linguistic bias rather than just overt violations",
      "Highly relevant for misinformation and propaganda detection",
    ],
    limitations: [
      "Trained on Wikipedia-style formal writing",
      "May flag strongly opinionated but legitimate content as biased",
    ],
    link: "https://huggingface.co/valurank/distilroberta-bias",
    linkLabel: "View on HuggingFace →",
    tier: "opensource",
  },
]
