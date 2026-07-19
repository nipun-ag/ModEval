import type { Platform } from "@/types/api"

export const PLATFORMS: Array<{
  id: Platform
  name: string
  description: string
}> = [
  {
    id: "Reddit",
    name: "Reddit",
    description: "Zero tolerance for violence, self-harm, sexual/minors, and hate",
  },
  {
    id: "Discord",
    name: "Discord",
    description: "Stricter on threatening harassment, more lenient on profanity and toxicity",
  },
  {
    id: "Facebook",
    name: "Facebook",
    description:
      "Broad zero tolerance across hate, violence, sexual content, self-harm, and harassment",
  },
  {
    id: "Instagram",
    name: "Instagram",
    description:
      "Broad zero tolerance across hate, violence, sexual content, self-harm, and harassment",
  },
  {
    id: "Custom",
    name: "Custom",
    description: "Write your own policy rules and thresholds",
  },
]

export const PLATFORM_POLICIES: Record<Platform, string[]> = {
  Reddit: [
    "Rule 1: Do not post content that incites violence or promotes hate based on identity or vulnerability",
    "Rule 2: Do not engage in content manipulation including spamming, vote manipulation, or ban evasion",
    "Rule 3: Do not reveal personal or confidential information about others (doxxing)",
    "Rule 4: Do not share or encourage sexual or suggestive content involving minors",
    "Rule 5: Do not impersonate individuals or entities in a misleading manner",
    "Rule 6: Label graphic, sexually-explicit, or offensive content appropriately",
    "Rule 7: Do not post illegal content or facilitate illegal transactions",
  ],
  Discord: [
    "Do not share content that sexualizes minors in any way — zero tolerance",
    "Do not use Discord to threaten others or organize real-world violence",
    "Do not share non-consensual intimate imagery",
    "Do not harass, bully, or coordinate harassment of individuals",
    "Do not promote hate speech targeting identity or vulnerability",
    "Profanity, insults, and general toxicity are not prohibited at platform level",
    "Server owners may set stricter local rules beyond platform guidelines",
    "Do not engage in phishing, malware distribution, or financial scams",
  ],
  Facebook: [
    "Hate speech: Content promoting hatred or violence based on race, ethnicity, religion, gender, sexual orientation, or disability is prohibited",
    "Violence and incitement: Content that threatens, incites, or glorifies real-world violence is prohibited",
    "Suicide and self-injury: Content promoting, glorifying, or instructing self-harm is prohibited",
    "Bullying and harassment: Repeated unwanted contact, demeaning attacks, and shaming content is prohibited",
    "Graphic violence: Gratuitous graphic or violent content is prohibited",
    "Adult nudity and sexual activity: Explicit nudity and sexual content is prohibited",
    "Child safety: Any sexual content involving minors is strictly prohibited",
    "Privacy violations: Sharing personal information without consent is prohibited",
  ],
  Instagram: [
    "Hate speech: Content promoting discrimination or violence based on protected characteristics is prohibited",
    "Violence and graphic content: Content glorifying or threatening real-world violence is prohibited",
    "Self-injury and eating disorders: Content that promotes or glorifies self-harm is prohibited",
    "Harassment and bullying: Targeted harassment and shaming content is prohibited",
    "Sexual content: Explicit nudity and sexually suggestive content is prohibited",
    "Child safety: Any sexual content involving minors is strictly prohibited — zero tolerance",
    "Misinformation: False information that could cause real-world harm is actioned",
    "Note: Instagram and Facebook share unified Community Standards (unified November 2024)",
  ],
  Custom: [
    "Rules are defined by your custom policy input below",
    "The AI interpretation model will use your custom rules to assess alignment",
  ],
}

export const PLATFORM_TOOLTIP =
  "Platform choice tells our interpretation layer how to judge each model's output. The models themselves are always frozen. Switch platforms to see how alignment scores change. Check 'How It Works' in the top nav to learn more."
