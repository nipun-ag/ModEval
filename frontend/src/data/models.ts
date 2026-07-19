export const ENTERPRISE_MODELS = [
  "Hive Moderation",
  "Azure Content Safety",
  "Google NLP",
  "OpenAI Moderation",
] as const

export const OPENSOURCE_MODELS = [
  "HuggingFace toxic-bert",
  "HuggingFace RoBERTa offensive",
  "HuggingFace Hate Speech",
  "HuggingFace Bias Detector",
] as const

export const MODEL_DISPLAY: Record<
  string,
  { name: string; subtitle: string; chip: string }
> = {
  "Hive Moderation": {
    name: "Hive Moderation",
    subtitle: "thehive/v3",
    chip: "Proprietary",
  },
  "Azure Content Safety": {
    name: "Azure Content Safety",
    subtitle: "microsoft/azure",
    chip: "Proprietary",
  },
  "Google NLP": {
    name: "Google NLP",
    subtitle: "google/nlp",
    chip: "Proprietary",
  },
  "OpenAI Moderation": {
    name: "OpenAI Moderation",
    subtitle: "openai/omni-moderation-latest",
    chip: "Proprietary",
  },
  "HuggingFace toxic-bert": {
    name: "toxic-bert",
    subtitle: "unitary/toxic-bert",
    chip: "BERT",
  },
  "HuggingFace RoBERTa offensive": {
    name: "RoBERTa Offensive",
    subtitle: "cardiffnlp/roberta-offensive",
    chip: "RoBERTa",
  },
  "HuggingFace Hate Speech": {
    name: "RoBERTa Hate Speech",
    subtitle: "facebook/roberta-hate-speech",
    chip: "facebook",
  },
  "HuggingFace Bias Detector": {
    name: "DistilRoBERTa Bias",
    subtitle: "valurank/distilroberta-bias",
    chip: "valurank",
  },
}

export const MAX_INPUT_LENGTH = 500
