const form = document.getElementById("analyze-form");
const textInput = document.getElementById("text");
const charCounter = document.getElementById("char-counter");
const statusPill = document.getElementById("status-pill");
const resultsBody = document.getElementById("results-body");
const disagreementBanner = document.getElementById("disagreement-banner");
const explainabilityList = document.getElementById("explainability-list");
const strictestModel = document.getElementById("strictest-model");
const mostLenientModel = document.getElementById("most-lenient-model");
const batchSummary = document.getElementById("batch-summary");
const customPolicyField = document.getElementById("custom-policy-field");
const analyzeButton = document.getElementById("analyze-button");
const workspace = document.querySelector(".workspace");
const benchmarkPanel = document.getElementById("benchmark-panel");
const aiDisagreementText = document.getElementById("ai-disagreement-text");
const aiRiskText = document.getElementById("ai-risk-text");
const aiContextText = document.getElementById("ai-context-text");
const aiCategoryText = document.getElementById("ai-category-text");

analyzeButton.addEventListener("mousedown", () => {
  analyzeButton.classList.add("loading");
});

const resultsEmpty = document.getElementById("results-empty");
const skeletonState = document.getElementById("skeleton-state");
const resultsContent = document.getElementById("results-content");
const strictestCard = document.getElementById("strictest-card");
const lenientCard = document.getElementById("lenient-card");
const consensusHero = document.getElementById("consensus-hero");
const heroAction = document.getElementById("hero-action");
const heroSubtitle = document.getElementById("hero-subtitle");
const exampleButtons = Array.from(document.querySelectorAll(".example-pill"));
const confirmPolicyBtn = document.getElementById("confirm-policy-btn");
const confirmPolicyMsg = document.getElementById("confirm-policy-msg");

if (confirmPolicyBtn) {
  confirmPolicyBtn.addEventListener("click", () => {
    confirmPolicyMsg.classList.remove("hidden");
    setTimeout(() => {
      confirmPolicyMsg.classList.add("hidden");
    }, 2000);
  });
}

// Initialize column info icon tooltips
function initColumnTooltips() {
  let currentTooltip = null;

  document.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("col-info-icon")) {
      const tooltipText = e.target.getAttribute("data-tooltip");
      if (!tooltipText) return;

      // Create or reuse tooltip element
      if (!currentTooltip) {
        currentTooltip = document.createElement("div");
        currentTooltip.className = "header-tooltip";
        document.body.appendChild(currentTooltip);
      }

      // Split first sentence and wrap in <strong>
      const firstPeriodIndex = tooltipText.indexOf(".");
      let tooltipHTML;
      if (firstPeriodIndex > 0) {
        const firstSentence = tooltipText.substring(0, firstPeriodIndex + 1);
        const restOfText = tooltipText.substring(firstPeriodIndex + 1).trim();
        tooltipHTML = `<strong>${escapeHtml(firstSentence)}</strong>${restOfText ? " " + escapeHtml(restOfText) : ""}`;
      } else {
        tooltipHTML = escapeHtml(tooltipText);
      }
      currentTooltip.innerHTML = tooltipHTML;
      currentTooltip.style.display = "block";

      // Position tooltip above the icon, with fallback to below
      const rect = e.target.getBoundingClientRect();
      const tooltipHeight = currentTooltip.offsetHeight || 60; // Estimate if not yet rendered
      const viewportHeight = window.innerHeight;

      const spaceAbove = rect.top;
      const horizontalCenter = rect.left + rect.width / 2;
      currentTooltip.style.left = horizontalCenter - 90 + "px"; // Center the tooltip (180px wide, so 90px offset)

      if (spaceAbove > tooltipHeight + 8) {
        // Position above
        currentTooltip.style.top = rect.top - tooltipHeight - 8 + "px";
      } else {
        // Fallback to below
        currentTooltip.style.top = rect.bottom + 8 + "px";
      }
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.classList.contains("col-info-icon") && currentTooltip) {
      currentTooltip.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", initColumnTooltips);

const ENTERPRISE_MODELS = [
  "Hive Moderation",
  "Azure Content Safety",
  "Google NLP",
  "OpenAI Moderation",
];

const OPENSOURCE_MODELS = [
  "HuggingFace toxic-bert",
  "HuggingFace RoBERTa offensive",
  "HuggingFace Hate Speech",
  "HuggingFace Bias Detector",
];

const MODEL_DISPLAY = {
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
    name: "General Toxicity",
    subtitle: "unitary/toxic-bert",
    chip: "BERT",
  },
  "HuggingFace RoBERTa offensive": {
    name: "Social Media Offensive",
    subtitle: "cardiffnlp/roberta-offensive",
    chip: "RoBERTa",
  },
  "HuggingFace Hate Speech": {
    name: "Identity-Based Hate",
    subtitle: "facebook/roberta-hate-speech",
    chip: "facebook",
  },
  "HuggingFace Bias Detector": {
    name: "Language Bias",
    subtitle: "valurank/distilroberta-bias",
    chip: "valurank",
  },
};

const EXAMPLE_LIBRARY = {
  Harassment: [
    "I know where you live and I will find you, don't think I won't",
    "You better watch your back walking home tonight, I'm serious",
    "I've been watching your posts for weeks you can't hide from me",
    "Tell your family I said hello, I know exactly who they are",
    "Keep posting that shit and see what the fuck happens to you",
    "You reported me? Big mistake. I don't forget and I don't forgive",
    "I will make sure everyone knows what you really are you fake bastard",
    "Your address isn't hard to find, just so you know",
    "Every single time you post I'm going to be right there",
    "You think blocking me does anything? You're so fucking naive",
  ],
  "Hate Speech": [
    "People from that country are all criminals and should be thrown out",
    "That religion is a cancer on society and its followers are dangerous as hell",
    "Women don't belong in leadership, they're too damn emotional to handle it",
    "That ethnic group has always been the rot at the center of this country",
    "People like them shouldn't be allowed to vote or own property",
    "That community is infesting our neighborhoods and bringing crime with them",
    "Their kind has never contributed a damn thing to civilization",
    "That group is genetically wired to be violent, the data proves it",
    "They control the banks and the media and we need to wake the fuck up",
    "They should all be shipped back to wherever the hell they came from",
  ],
  Spam: [
    "CONGRATULATIONS!! You've been selected for a $1000 gift card, click NOW before it expires",
    "Make $5000 a week from home, no experience needed, DM me and I'll show you how",
    "Your account has been hacked, verify your identity immediately at this link or lose access",
    "FREE iPhone giveaway!! Just follow, like, and DM your address to claim your prize",
    "I made $47,000 last month doing this one thing, ask me how and I'll send you the link",
    "URGENT: Your payment failed, update billing info now or your account gets suspended today",
    "Buy 10,000 real followers for $9.99, guaranteed delivery in 24 hours, DM to order",
    "You have an unclaimed inheritance of $2.4 million waiting, contact our agent to release funds",
    "Lose 30 pounds in 30 days with this doctor-approved trick they don't want you to know about",
    "Your package couldn't be delivered, click here within 24 hours or it gets sent back permanently",
  ],
  Bias: [
    "The radical left is hell-bent on destroying everything this country was built on",
    "Only a complete idiot could possibly support that policy, wake the fuck up",
    "The mainstream media is actively hiding the real truth and you're too blind to see it",
    "Any real patriot knows the election was stolen, the evidence is right in front of you",
    "Anyone who disagrees with this is either corrupt, paid off, or completely brain-dead",
    "The globalist agenda is pulling the strings behind every major world event, always has been",
    "These so-called experts have been catastrophically wrong about everything, stop listening to them",
    "If you vote for that party you clearly hate your own country and everything it stands for",
    "The deep state controls every single thing you see on the news, none of it is real",
    "Smart people already know the government has been lying to us about this for decades",
  ],
  "Violent Threats": [
    "I will hunt you down and make you pay for what you did",
    "Someone needs to put a bullet in that politician's head",
    "That whole neighborhood deserves to burn to the ground",
    "If I ever see you in person I will beat you within an inch of your life",
    "People like that deserve to be lined up and shot",
    "I know where your kids go to school, just saying",
    "That judge should be dragged out of the courthouse and dealt with",
    "We need to rise up and eliminate everyone who stands against us",
    "Next time you show your face around here it will be your last",
    "That CEO deserves what's coming to him, someone should make it happen",
  ],
  Misinformation: [
    "Vaccines contain microchips that track your location in real time",
    "The moon landing was staged in a Hollywood studio, NASA admitted it privately",
    "Drinking bleach kills the virus, doctors are hiding this cure from you",
    "5G towers were specifically designed to spread disease through radiation",
    "The election was stolen through software that flipped millions of votes",
    "Climate change is a hoax invented by scientists to secure research funding",
    "HIV does not cause AIDS, this was proven decades ago and suppressed",
    "Chemtrails are chemical agents being sprayed to control the population",
    "The government is putting fluoride in water to make people docile and compliant",
    "COVID-19 was engineered in a lab and released intentionally to reduce population",
  ],
  Doxxing: [
    "Here is his home address and phone number: 47 Maple Drive, +1-847-293-5521, do what you want with it",
    "I found her workplace, her daily schedule, and her car registration: KJH 4892. Sharing now",
    "His kids go to Lincoln Elementary on 5th Street, he picks them up at 3:15pm every day",
    "Her full name is Sarah Mitchell, she lives at 234 Oak Lane Portland, works at Deloitte. Spread this",
    "I have his mother's address -- 89 Birchwood Ave, Apt 4B -- if anyone wants to pay her a visit",
    "Here is everything I found on her -- SSN 472-91-8834, Chase bank, lives at 12 Sunset Blvd",
    "His girlfriend's number is +1-312-847-9021, feel free to let her know what he really did",
    "I am going to post your real name James Harlow and address 567 Creek Road unless you take that down",
    "Found her Instagram @real.emma.k, LinkedIn, home address 88 Fern Street and daily commute route. All yours",
    "Everyone should know where this person lives. Posting Marcus Webb's full details at 9pm tonight",
  ],
  Radicalization: [
    "Our race is under attack and it is our duty to defend it by any means necessary",
    "The only solution is to purge the corrupt system and everyone who protects it",
    "True believers must be willing to sacrifice everything to cleanse this society",
    "They will never stop unless we make them stop. Violence is the only language they understand",
    "Join us brothers, the time for talk is over, action is the only path forward now",
    "Every soldier who dies fighting the infidels is a martyr guaranteed paradise",
    "We have been patient long enough, it is time to take back what is ours by force",
    "The weak will always compromise, only the strong are willing to do what is necessary",
    "Our enemies are everywhere -- in government, media, schools. They must be removed",
    "If you are not willing to fight and die for the cause then you are part of the problem",
  ],
  Impersonation: [
    "Hi this is Elon Musk's personal account, I am giving away 10 BTC to the first 100 followers",
    "Official announcement from the WHO: new lockdown begins Monday, stock up now",
    "This is your bank's fraud department. Your account has been suspended, verify here immediately",
    "I am a nurse at your local hospital. Your family member has been in an accident, call this number",
    "Breaking: President confirms emergency declaration. This is the official White House account",
    "Hi I am the real Taylor Swift, this is my private fan account where I share exclusive content",
    "This is Apple Support. Your iCloud has been breached. Click here to secure your account now",
    "Official government notice: your tax refund of $3,200 is ready. Claim it at this link",
    "I am a moderator from this platform. Your account will be banned unless you verify here",
    "This is the real account of a famous celebrity. My main was hacked, please follow this one instead",
  ],
};

const lastExampleByCategory = {};
let selectedPlatform = "Reddit";
let lastAnalyzedText = "";

const PLATFORM_POLICIES = {
  "Reddit": {
    rules: [
      "Rule 1: Do not post content that incites violence or promotes hate based on identity or vulnerability",
      "Rule 2: Do not engage in content manipulation including spamming, vote manipulation, or ban evasion",
      "Rule 3: Do not reveal personal or confidential information about others (doxxing)",
      "Rule 4: Do not share or encourage sexual or suggestive content involving minors",
      "Rule 5: Do not impersonate individuals or entities in a misleading manner",
      "Rule 6: Label graphic, sexually-explicit, or offensive content appropriately",
      "Rule 7: Do not post illegal content or facilitate illegal transactions"
    ]
  },
  "Discord": {
    rules: [
      "Do not share content that sexualizes minors in any way — zero tolerance",
      "Do not use Discord to threaten others or organize real-world violence",
      "Do not share non-consensual intimate imagery",
      "Do not harass, bully, or coordinate harassment of individuals",
      "Do not promote hate speech targeting identity or vulnerability",
      "Profanity, insults, and general toxicity are not prohibited at platform level",
      "Server owners may set stricter local rules beyond platform guidelines",
      "Do not engage in phishing, malware distribution, or financial scams"
    ]
  },
  "Facebook": {
    rules: [
      "Hate speech: Content promoting hatred or violence based on race, ethnicity, religion, gender, sexual orientation, or disability is prohibited",
      "Violence and incitement: Content that threatens, incites, or glorifies real-world violence is prohibited",
      "Suicide and self-injury: Content promoting, glorifying, or instructing self-harm is prohibited",
      "Bullying and harassment: Repeated unwanted contact, demeaning attacks, and shaming content is prohibited",
      "Graphic violence: Gratuitous graphic or violent content is prohibited",
      "Adult nudity and sexual activity: Explicit nudity and sexual content is prohibited",
      "Child safety: Any sexual content involving minors is strictly prohibited",
      "Privacy violations: Sharing personal information without consent is prohibited"
    ]
  },
  "Instagram": {
    rules: [
      "Hate speech: Content promoting discrimination or violence based on protected characteristics is prohibited",
      "Violence and graphic content: Content glorifying or threatening real-world violence is prohibited",
      "Self-injury and eating disorders: Content that promotes or glorifies self-harm is prohibited",
      "Harassment and bullying: Targeted harassment and shaming content is prohibited",
      "Sexual content: Explicit nudity and sexually suggestive content is prohibited",
      "Child safety: Any sexual content involving minors is strictly prohibited — zero tolerance",
      "Misinformation: False information that could cause real-world harm is actioned",
      "Note: Instagram and Facebook share unified Community Standards (unified November 2024)"
    ]
  },
  "Custom": {
    rules: [
      "Rules are defined by your custom policy input below",
      "The AI interpretation model will use your custom rules to assess alignment"
    ]
  }
};

const STATE_MAP = {
  platform: (value) => {
    selectedPlatform = value;
    updateCustomPolicyVisibility();
    updatePlatformPolicyBox(value);
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setStatus(message, state) {
  statusPill.textContent = message;
  statusPill.className = `status-pill ${state}`;

  // Show/hide disclaimer based on completion state
  const disclaimer = document.getElementById("status-disclaimer");
  if (disclaimer) {
    if (state === "success") {
      disclaimer.style.display = "block";
    } else {
      disclaimer.style.display = "none";
    }
  }
}

function setAnalyzeLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.classList.toggle("loading", isLoading);
  analyzeButton.querySelector(".button-label").textContent = isLoading ? "Analyzing..." : "Execute Analysis";
}

function updateCustomPolicyVisibility() {
  if (!customPolicyField) {
    return;
  }
  customPolicyField.classList.toggle("hidden", selectedPlatform !== "Custom");
}

function updatePlatformPolicyBox(platform) {
  const policyBox = document.getElementById("platform-policy-box");
  if (!policyBox) return;

  const policy = PLATFORM_POLICIES[platform];
  if (!policy) return;

  const rulesHtml = policy.rules
    .map((rule) => `<li>${escapeHtml(rule)}</li>`)
    .join("");

  policyBox.innerHTML = `
    <button class="platform-policy-header" type="button">
      <span class="platform-policy-box-label">PLATFORM POLICY GUIDELINES</span>
      <span class="platform-policy-chevron">⌄</span>
    </button>
    <div class="platform-policy-content">
      <ul>${rulesHtml}</ul>
      <div class="platform-policy-footer">
        Guidelines sourced from official platform documentation. Last verified May 2026.
      </div>
    </div>
  `;

  // Set up collapse/expand toggle
  const header = policyBox.querySelector(".platform-policy-header");
  const content = policyBox.querySelector(".platform-policy-content");

  if (header && content) {
    // Default to collapsed
    header.setAttribute("aria-expanded", "false");
    content.classList.add("collapsed");

    header.addEventListener("click", () => {
      const isExpanded = header.getAttribute("aria-expanded") === "true";
      header.setAttribute("aria-expanded", String(!isExpanded));
      content.classList.toggle("collapsed");
    });
  }
}

function initializeModalSelects() {
  const backdrop = document.createElement("div");
  backdrop.className = "select-modal-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.innerHTML = `
    <div class="select-modal-panel" role="dialog" aria-modal="true">
      <p class="select-modal-heading"></p>
      <div class="select-modal-options"></div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const panel = backdrop.querySelector(".select-modal-panel");
  const heading = backdrop.querySelector(".select-modal-heading");
  const optionsContainer = backdrop.querySelector(".select-modal-options");

  let currentSelect = null;
  let closeTimer = null;

  function closeModal() {
    if (!currentSelect) return;
    if (closeTimer) clearTimeout(closeTimer);
    panel.classList.remove("animating-open");
    panel.classList.add("animating-close");
    closeTimer = setTimeout(() => {
      backdrop.style.display = "none";
      backdrop.setAttribute("aria-hidden", "true");
      panel.classList.remove("animating-close");
      currentSelect = null;
    }, 150);
  }

  function openModal(selectEl) {
    if (closeTimer) clearTimeout(closeTimer);
    currentSelect = selectEl;

    const hiddenInput = selectEl.querySelector("input[type='hidden']");
    const fieldBlock = selectEl.closest(".field-block");
    const labelEl = fieldBlock ? (fieldBlock.querySelector("label") || fieldBlock.querySelector(".platform-label-text")) : null;
    const labelText = labelEl ? labelEl.textContent.trim() : "";
    const options = Array.from(selectEl.querySelectorAll(".custom-select-option"));

    heading.textContent = `Select ${labelText}`;
    optionsContainer.innerHTML = "";

    options.forEach((opt) => {
      const nameEl = opt.querySelector(".custom-select-name");
      const descEl = opt.querySelector(".custom-select-description");
      const val = opt.dataset.value;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "select-modal-option" + (opt.classList.contains("selected") ? " selected" : "");
      btn.dataset.value = val;
      btn.innerHTML =
        `<span class="select-modal-name">${escapeHtml(nameEl ? nameEl.textContent.trim() : val)}</span>` +
        (descEl ? `<span class="select-modal-description">${escapeHtml(descEl.textContent.trim())}</span>` : "");

      btn.addEventListener("click", () => {
        hiddenInput.value = val;
        const triggerLabel = selectEl.querySelector(".custom-select-trigger-label");
        triggerLabel.textContent = btn.querySelector(".select-modal-name").textContent;
        options.forEach((o) => o.classList.toggle("selected", o.dataset.value === val));
        if (STATE_MAP[hiddenInput.name]) STATE_MAP[hiddenInput.name](val);
        closeModal();
      });

      optionsContainer.appendChild(btn);
    });

    const trigger = selectEl.querySelector(".custom-select-trigger");
    const triggerRect = trigger.getBoundingClientRect();
    const fromX = (triggerRect.left + triggerRect.width / 2) - window.innerWidth / 2;
    const fromY = (triggerRect.top + triggerRect.height / 2) - window.innerHeight / 2;
    panel.style.setProperty("--modal-from-x", `${fromX}px`);
    panel.style.setProperty("--modal-from-y", `${fromY}px`);

    panel.classList.remove("animating-close", "animating-open");
    backdrop.style.display = "flex";
    backdrop.setAttribute("aria-hidden", "false");
    void panel.offsetWidth;
    panel.classList.add("animating-open");
  }

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && currentSelect) closeModal();
  });

  document.querySelectorAll(".custom-select").forEach((selectEl) => {
    const hiddenInput = selectEl.querySelector("input[type='hidden']");
    const initialSelected = selectEl.querySelector(".custom-select-option.selected");
    if (initialSelected) {
      hiddenInput.value = initialSelected.dataset.value;
      if (STATE_MAP[hiddenInput.name]) {
        STATE_MAP[hiddenInput.name](initialSelected.dataset.value);
      }
    }

    selectEl.querySelector(".custom-select-trigger").addEventListener("click", () => openModal(selectEl));
  });
}

function updateCounter() {
  const count = textInput.value.length;
  charCounter.textContent = `${count} / 500`;
  charCounter.classList.remove("counter-green", "counter-amber", "counter-red");
  if (count < 300) charCounter.classList.add("counter-green");
  else if (count < 450) charCounter.classList.add("counter-amber");
  else charCounter.classList.add("counter-red");
}

function modelDisplay(modelName) {
  return MODEL_DISPLAY[modelName] || { name: modelName, subtitle: "", chip: "model" };
}

function renderModelDisplay(modelName, includeChip = false) {
  const display = modelDisplay(modelName);
  const chip = includeChip ? `<span class="model-chip">${escapeHtml(display.chip)}</span>` : "";
  const primary = includeChip
    ? `<div class="model-primary"><span class="model-title">${escapeHtml(display.name)}</span>${chip}</div>`
    : `<span class="model-title">${escapeHtml(display.name)}</span>`;
  const subtitle = display.subtitle
    ? `<span class="model-subtitle">${escapeHtml(display.subtitle)}</span>`
    : "";
  return `${primary}${subtitle}`;
}

function actionTone(action) {
  const normalized = String(action || "").toLowerCase();
  if (normalized === "allow") {
    return "allow";
  }
  if (normalized === "error") {
    return "error";
  }
  if (normalized === "remove") {
    return "remove";
  }
  if (normalized === "review") {
    return "review";
  }
  return "neutral";
}

function severityTone(severity) {
  if (severity >= 8) {
    return "high";
  }
  if (severity >= 4) {
    return "medium";
  }
  return "low";
}

function badge(label, variant) {
  return `<span class="badge ${variant}">${escapeHtml(label)}</span>`;
}

function firstTwoSentences(text) {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return "";
  }

  const parts = normalized.split(". ").filter(Boolean);
  if (parts.length <= 2) {
    return normalized;
  }

  const summary = parts.slice(0, 2).join(". ");
  return /[.!?]$/.test(summary) ? summary : `${summary}.`;
}

function setHeroState(action, summary) {
  const tone = actionTone(action);
  const borderColors = {
    allow: "var(--green)",
    review: "var(--amber)",
    remove: "var(--red)",
    neutral: "var(--amber)",
  };
  const displayAction = String(action || "Review").toUpperCase();
  const color = borderColors[tone] || borderColors.review;

  heroAction.textContent = displayAction;
  heroSubtitle.textContent = firstTwoSentences(summary);
  consensusHero.style.borderLeftColor = color;
  heroAction.style.color = color;
}

function setPrimaryView(view) {
  const showBenchmark = view === "benchmark";
  if (workspace) workspace.style.display = 
    showBenchmark ? "none" : "grid";
  if (benchmarkPanel) benchmarkPanel.style.display = 
    showBenchmark ? "block" : "none";
  const navAnalysis = document.getElementById('nav-analysis');
  const navBenchmark = document.getElementById('nav-benchmark');
  if (navAnalysis) navAnalysis.classList.toggle(
    "active", !showBenchmark);
  if (navBenchmark) navBenchmark.classList.toggle(
    "active", showBenchmark);
}

function setSectionExpanded(toggle, content, expanded) {
  toggle.setAttribute("aria-expanded", String(expanded));
  content.setAttribute("aria-hidden", String(!expanded));
  content.classList.toggle("expanded", expanded);
  if (expanded) {
    content.style.maxHeight = `${content.scrollHeight}px`;
  } else {
    content.style.maxHeight = "0px";
  }
}

function applyExample(category, button) {
  const examples = EXAMPLE_LIBRARY[category] || [];
  if (!examples.length) {
    return;
  }

  let nextExample = examples[Math.floor(Math.random() * examples.length)];
  if (examples.length > 1) {
    while (nextExample === lastExampleByCategory[category]) {
      nextExample = examples[Math.floor(Math.random() * examples.length)];
    }
  }

  lastExampleByCategory[category] = nextExample;
  textInput.value = nextExample;
  textInput.classList.remove("example-loaded");
  void textInput.offsetWidth;
  textInput.classList.add("example-loaded");
  updateCounter();
  textInput.focus();

  exampleButtons.forEach((pill) => pill.classList.remove("active"));
  button.classList.add("active");
  window.setTimeout(() => button.classList.remove("active"), 450);
}

function showPanelState(state) {
  resultsEmpty.classList.toggle("hidden", state !== "empty");
  skeletonState.classList.toggle("hidden", state !== "loading");
  resultsContent.classList.toggle("hidden", state !== "results");
}

function renderBreakdownCard(result) {
  const display = modelDisplay(result.model);

  if (result.disabled) {
    return `
      <div class="breakdown-card" style="opacity:0.4;">
        <div class="breakdown-model-info">
          <div class="breakdown-model-name">${escapeHtml(display.name)}</div>
          <div class="breakdown-model-meta">${escapeHtml(display.subtitle)}</div>
          <span class="breakdown-arch-chip">${escapeHtml(display.chip)}</span>
        </div>
        <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-style:italic;color:var(--muted);">Coming Soon</span>
      </div>
    `;
  }

  if (result.error) {
    return `
      <div class="breakdown-card aligned-error">
        <div class="breakdown-model-info">
          <div class="breakdown-model-name">${escapeHtml(display.name)}</div>
          <div class="breakdown-model-meta">${escapeHtml(display.subtitle)} â€¢ Model unavailable</div>
          <span class="breakdown-arch-chip">${escapeHtml(display.chip)}</span>
        </div>
        <div class="breakdown-fields">
          <div class="breakdown-field-value">unavailable</div>
          <div class="severity-bar-wrap">
            <span class="severity-bar-number" style="color:var(--muted);">â€”</span>
            <div class="severity-bar-track">
              <div class="severity-bar-fill" style="width:0;"></div>
            </div>
          </div>
          <div class="breakdown-confidence">â€”</div>
        </div>
        <button class="breakdown-action-btn action-error">Error</button>
      </div>
    `;
  }

  const tone = actionTone(result.action);
  const borderClass = tone === "allow" ? "aligned-allow" : tone === "remove" ? "aligned-remove" : "aligned-review";
  const actionBtnClass = tone === "allow" ? "action-allow" : tone === "remove" ? "action-remove" : "action-review";

  const severity = Number(result.severity);
  const sevClass = severity <= 3 ? "low" : severity <= 7 ? "mid" : "high";
  const sevColorVar = sevClass === "low" ? "var(--green)" : sevClass === "mid" ? "var(--amber)" : "var(--red)";
  const sevWidth = Math.round((severity / 10) * 100);

  return `
    <div class="breakdown-card ${borderClass}">
      <div class="breakdown-model-info">
        <div class="breakdown-model-name">${escapeHtml(display.name)}</div>
        <div class="breakdown-model-meta">${escapeHtml(display.subtitle)} • ${result.error ? "Model unavailable" : "Live inference"}</div>
        <span class="breakdown-arch-chip">${escapeHtml(display.chip)}</span>
      </div>
      <div class="breakdown-fields">
        <div class="breakdown-field-value">${escapeHtml(result.top_category)}</div>
        <div class="severity-bar-wrap">
          <span class="severity-bar-number" style="color:${sevColorVar};">${severity}</span>
          <div class="severity-bar-track">
            <div class="severity-bar-fill ${sevClass}" style="width:${sevWidth}%;"></div>
          </div>
        </div>
        <div class="breakdown-confidence">${Number(result.confidence).toFixed(2)}</div>
      </div>
      <button class="breakdown-action-btn ${actionBtnClass}">${escapeHtml(result.action)}</button>
    </div>
  `;
}

function renderResults(results) {
  if (!results.length) {
    resultsBody.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--muted);">No model output available.</div>`;
    return;
  }

  let html = "";

  const headerRow = `
    <div class="breakdown-header-row">
      <div class="breakdown-header-spacer"></div>
      <div class="breakdown-header-fields">
        <span>CATEGORY</span>
        <span>SEVERITY</span>
        <span>CONFIDENCE</span>
      </div>
    </div>`;

  html += `<div class="breakdown-section">`;
  html += `<div class="breakdown-section-header">
    <span class="breakdown-section-icon">◈</span>
    <span class="breakdown-section-label">Enterprise APIs</span>
  </div>`;
  html += headerRow;
  ENTERPRISE_MODELS.forEach((modelName) => {
    const result = results.find(r => r.model === modelName);
    if (result) html += renderBreakdownCard(result);
  });
  html += `</div>`;

  html += `<div class="breakdown-section">`;
  html += `<div class="breakdown-section-header">
    <span class="breakdown-section-icon">⬡</span>
    <span class="breakdown-section-label">Open Source Models</span>
  </div>`;
  html += headerRow;
  OPENSOURCE_MODELS.forEach((modelName) => {
    const result = results.find(r => r.model === modelName);
    if (result) html += renderBreakdownCard(result);
  });
  html += `</div>`;

  resultsBody.innerHTML = html;
}

function getDisagreementItems(disagreements) {
  const items = [];

  if (disagreements?.action_mismatch?.length > 1) {
    items.push({
      key: "action_mismatch",
      type: "Action Mismatch",
      description: "Models disagree on the final moderation recommendation.",
      models: disagreements.action_mismatch,
    });
  }

  if (disagreements?.severity_gap?.length > 1) {
    items.push({
      key: "severity_gap",
      type: "Severity Gap",
      description: "Models disagree on how severe this content is.",
      models: disagreements.severity_gap,
    });
  }

  if (disagreements?.category_mismatch?.length > 1) {
    items.push({
      key: "category_mismatch",
      type: "Category Mismatch",
      description: "Models flagged different primary risk categories.",
      models: disagreements.category_mismatch,
    });
  }

  return items;
}

function renderDisagreements(disagreements) {
  const items = getDisagreementItems(disagreements);

  if (!items.length) {
    disagreementBanner.classList.add("hidden");
    disagreementBanner.classList.remove("visible");
    disagreementBanner.innerHTML = "";
    return;
  }

  const priorityOrder = ["Action Mismatch", "Severity Gap", "Category Mismatch"];
  const mostCritical = [...items].sort(
    (left, right) => priorityOrder.indexOf(left.type) - priorityOrder.indexOf(right.type)
  )[0];

  const messages = {
    "Action Mismatch": "Action conflict detected - models disagree on final recommendation",
    "Severity Gap": "Severity gap detected - models disagree on how serious this content is",
    "Category Mismatch": "Category mismatch detected - models flagged different primary risks",
  };

  disagreementBanner.innerHTML = `
    <span class="warning-icon">⚠</span>
    <span>${messages[mostCritical.type] || escapeHtml(mostCritical.description)}</span>
  `;
  disagreementBanner.classList.remove("hidden");
  requestAnimationFrame(() => disagreementBanner.classList.add("visible"));
}

function renderAlignmentAssessment(results, platform) {
  const container = document.getElementById("alignment-assessment-container");
  if (!container) return;

  const activeResults = results.filter((r) => !r.disabled && !r.error && r.alignment_reason);
  if (activeResults.length === 0) {
    container.innerHTML = "";
    return;
  }

  const listItems = activeResults
    .map((result) => {
      const badgeClass = result.aligned ? "badge-aligned" : "badge-misaligned";
      const badgeLabel = result.aligned ? "ALIGNED" : "MISALIGNED";
      return `
        <li class="alignment-assessment-item">
          <span class="alignment-model-name">${escapeHtml(result.model)}</span>
          <span class="badge ${badgeClass}">${badgeLabel}</span>
          <span class="alignment-reason-text">${escapeHtml(result.alignment_reason)}</span>
        </li>
      `;
    })
    .join("");

  container.innerHTML = `
    <section class="alignment-assessment-section">
      <p class="alignment-assessment-label">ALIGNMENT ASSESSMENT</p>
      <ul class="alignment-assessment-list">
        ${listItems}
      </ul>
      <p class="alignment-assessment-footer">
        Alignment assessed by Claude Haiku against ${escapeHtml(platform)} content policy.
      </p>
    </section>
  `;
}

function renderFindingTag(insights, data) {
  const riskText = (
    data?.ai_analysis?.risk_narrative || ""
  ).toUpperCase();

  let tagClass = "grey";
  let tagText = "GREY AREA";

  if (riskText.includes("CLEAR VIOLATION")) {
    tagClass = "violation";
    tagText = "CLEAR VIOLATION";
  } else if (riskText.includes("CLEAR SAFE")) {
    tagClass = "safe";
    tagText = "CLEAR SAFE";
  } else if (riskText.includes("GENUINE GREY AREA")) {
    tagClass = "grey";
    tagText = "GENUINE GREY AREA";
  }

  return `<span class="insights-finding-tag ${tagClass}">${tagText}</span>`;
}

function renderConfidenceBars(results) {
  if (!results || results.length === 0) return "";

  const activeResults = results.filter(r => !r.disabled && !r.error);

  return activeResults.map(result => {
    const confidence = parseFloat(result.confidence || 0);
    const confidencePercent = Math.round(confidence * 100);

    return `
      <div class="insights-confidence-item">
        <div class="insights-confidence-label">${escapeHtml(result.model || "")}</div>
        <div class="insights-confidence-bar-wrapper">
          <div class="insights-confidence-bar-fill" style="width: ${confidencePercent}%"></div>
        </div>
        <div class="insights-confidence-value">${confidence.toFixed(2)}</div>
      </div>
    `;
  }).join("");
}

function renderInsightsMatrix(alignmentMap, results) {
  const activeResults = (results || []).filter(
    r => !r.disabled && !r.error
  );

  if (!activeResults.length) {
    return '<div style="padding:16px;text-align:center;color:var(--muted);font-size:12px;">No alignment data available.</div>';
  }

  return activeResults.map(result => {
    const isAligned = result.aligned;
    const reason = result.alignment_reason || "";
    const badgeClass = isAligned ? "aligned" : "misaligned";
    const badgeText = isAligned ? "ALIGNED" : "MISALIGNED";

    return `
      <div class="insights-matrix-row">
        <div class="insights-matrix-model">
          ${escapeHtml(result.model || "")}
        </div>
        <div class="insights-matrix-alignment">
          <span class="insights-alignment-badge ${badgeClass}">
            ${badgeText}
          </span>
          <div class="insights-alignment-reason">
            ${escapeHtml(reason)}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderInsights(insights, results, platform, alignmentMap, data) {
  const strictest = insights?.strictest_model;
  const lenient = insights?.most_lenient_model;

  strictestModel.innerHTML = strictest?.model ? renderModelDisplay(strictest.model) : "-";
  mostLenientModel.innerHTML = lenient?.model ? renderModelDisplay(lenient.model) : "-";

  const strictestResult = results.find((result) => result.model === strictest?.model);
  const lenientResult = results.find((result) => result.model === lenient?.model);

  strictestCard.dataset.tone = actionTone(strictest?.action || strictestResult?.action || "review");
  lenientCard.dataset.tone = actionTone(lenient?.action || lenientResult?.action || "allow");

  // Build insights grid
  const insightsContainer = document.getElementById("lower-panel-insights");
  if (!insightsContainer) return;

  // Build disagreement text with inline colored action words
  const disagreementText = data?.ai_analysis?.disagreement_explanation || "No disagreement data available.";
  const escapedDisagreement = escapeHtml(disagreementText);
  const highlightedDisagreement = escapedDisagreement.replace(
    /\b(ALLOW|REVIEW|REMOVE)\b/g,
    (match) => {
      const cls = match === "REMOVE" ? "remove" : match === "REVIEW" ? "review" : "allow";
      return `<span class="insights-card-body-highlight ${cls}">${match}</span>`;
    }
  );

  // Build risk text with inline colored violation/safe/grey area
  const riskText = data?.ai_analysis?.risk_narrative || "No risk assessment available.";
  const escapedRisk = escapeHtml(riskText);
  const highlightedRisk = escapedRisk
    .replace(/CLEAR VIOLATION/g, '<span class="insights-card-body-highlight violation">CLEAR VIOLATION</span>')
    .replace(/CLEAR SAFE/g, '<span class="insights-card-body-highlight allow">CLEAR SAFE</span>')
    .replace(/GENUINE GREY AREA/g, '<span class="insights-card-body-highlight review">GENUINE GREY AREA</span>');

  const strictestDisplayName = MODEL_DISPLAY[strictest?.model]?.name || strictest?.model || "N/A";
  const strictestDisplaySubtitle = MODEL_DISPLAY[strictest?.model]?.subtitle || "";
  const lenientDisplayName = MODEL_DISPLAY[lenient?.model]?.name || lenient?.model || "N/A";
  const lenientDisplaySubtitle = MODEL_DISPLAY[lenient?.model]?.subtitle || "";

  const gridHTML = `
    <div class="insights-grid">
      <!-- Left: Disagreement Vector (tall) -->
      <div class="insights-card insights-card-tall">
        <div class="insights-card-top">
          <span class="insights-card-eyebrow disagreement">⇄ DISAGREEMENT VECTOR</span>
        </div>
        <p class="insights-card-body" style="margin-top:12px">
          ${highlightedDisagreement}
        </p>
      </div>

      <!-- Right column (flex stacked) -->
      <div class="insights-grid-right">
        <!-- Most Lenient (top) -->
        <div class="insights-card">
          <div class="insights-card-top">
            <span class="insights-card-eyebrow lenient">⬡ MOST LENIENT</span>
            <span style="color:var(--green);font-size:16px">⬡</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:12px">
            <div>
              <p class="insights-card-description" style="margin-bottom:8px">
                The model most likely to allow this content through.
              </p>
              <div class="insights-card-title">${escapeHtml(lenientDisplayName)}</div>
            </div>
            <div class="insights-card-subtitle">${escapeHtml(lenientDisplaySubtitle)}</div>
          </div>
        </div>

        <!-- Strictest Model (bottom) -->
        <div class="insights-card">
          <div class="insights-card-top">
            <span class="insights-card-eyebrow">◈ STRICTEST MODEL</span>
            <span style="color:var(--accent);font-size:16px">◈</span>
          </div>
          <p class="insights-card-description">
            The model that flagged this content most aggressively across all signals.
          </p>
          <div class="insights-card-bottom">
            <div class="insights-card-title">${escapeHtml(strictestDisplayName)}</div>
            <div class="insights-card-subtitle">${escapeHtml(strictestDisplaySubtitle)}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alignment Assessment Matrix -->
    <div class="insights-alignment-section">
      <h4 class="insights-alignment-header">Policy Alignment</h4>
      <div class="insights-matrix">
        ${renderInsightsMatrix({}, results)}
      </div>
      <div class="insights-matrix-footer">
        Alignment assessed by Claude Haiku against ${escapeHtml(platform)} content policy.
      </div>
    </div>

    <!-- AI Executive Summary -->
    <div class="insights-ai-section">
      <div class="insights-ai-header">
        <span class="insights-ai-label">Executive Summary</span>
        <span class="insights-consensus-badge">
          <span class="dot">●</span>
          Consensus: <strong>${escapeHtml(data?.insights?.consensus_recommendation || insights?.consensus_recommendation || "—")}</strong>
        </span>
      </div>

      ${renderFindingTag(insights, data)}

      <div class="insights-ai-summary">
        ${escapeHtml(
          (data?.ai_analysis?.risk_narrative || "Analysis complete.")
            .replace(/^CLEAR VIOLATION[.\s]*/i, "")
            .replace(/^GENUINE GREY AREA[.\s]*/i, "")
            .replace(/^CLEAR SAFE[.\s]*/i, "")
        )}
      </div>

      <div class="insights-bars-header">MODEL CONFIDENCE</div>
      <div class="insights-confidence-bars">
        ${renderConfidenceBars(results)}
      </div>
    </div>
  `;

  // Clear old content and insert new structure
  const disclaimerHTML = `
    <div class="ai-interpretation-disclaimer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; opacity:0.6;">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="8"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
      </svg>
      <span>Interpreted by Claude Haiku. AI interpretation is probabilistic and may contain errors — intended to assist human review, not replace it.</span>
    </div>`;
  insightsContainer.innerHTML = disclaimerHTML + gridHTML;
}

function renderAiAnalysis(aiAnalysis) {
  if (!aiAnalysis || Object.keys(aiAnalysis).length === 0) {
    if (aiDisagreementText) aiDisagreementText.textContent = "Analysis unavailable.";
    if (aiRiskText) aiRiskText.textContent = "Analysis unavailable.";
    if (aiContextText) aiContextText.textContent = "Analysis unavailable.";
    if (aiCategoryText) aiCategoryText.textContent = "-";
    return;
  }
  if (aiDisagreementText) aiDisagreementText.textContent = aiAnalysis.disagreement_explanation || "-";
  if (aiRiskText) aiRiskText.textContent = aiAnalysis.risk_narrative || "-";
  if (aiContextText) aiContextText.textContent = aiAnalysis.context_sensitivity || "-";
  if (aiCategoryText) aiCategoryText.textContent = aiAnalysis.contested_category || "-";
}


function generateConsensusSummary(results, insights, disagreements) {
  if (!results || results.length === 0) return "";

  const activeResults = results.filter((result) => !result.disabled && !result.error);
  if (!activeResults.length) return "";

  const total = activeResults.length;
  const actions = { allow: [], review: [], remove: [] };
  activeResults.forEach(r => {
    const tone = actionTone(r.action);
    if (actions[tone]) actions[tone].push(r.model);
  });

  const removeCount = actions.remove.length;
  const reviewCount = actions.review.length;
  const allowCount = actions.allow.length;

  // Build verdict sentence
  let verdict = "";
  if (removeCount === total) {
    verdict = `All ${total} models recommend removal.`;
  } else if (allowCount === total) {
    verdict = `All ${total} models cleared this content.`;
  } else if (removeCount > allowCount && removeCount > reviewCount) {
    verdict = `${removeCount} of ${total} models recommend removal.`;
  } else if (allowCount > removeCount && allowCount > reviewCount) {
    verdict = `${allowCount} of ${total} models cleared this content.`;
  } else {
    verdict = `Models are split — ${removeCount} remove, ${reviewCount} review, ${allowCount} allow.`;
  }

  // Collect all flagged categories from explanations
  const allCategories = [];
  activeResults.forEach(r => {
    const match = /Categories above[\d\s.:]+(.+?)(?:\.|$)/i.exec(r.explanation || "");
    if (match) {
      const cats = match[1].match(/([\w][\w\/.-]+)\s*\([\d.]+\)/g) || [];
      cats.forEach(c => {
        const name = c.replace(/\s*\([\d.]+\)/, "").trim();
        if (name) allCategories.push(name);
      });
    } else if (r.top_category) {
      allCategories.push(r.top_category);
    }
  });

  const categoryCounts = {};
  allCategories.forEach(c => { categoryCounts[c] = (categoryCounts[c] || 0) + 1; });
  const primaryCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const signalSentence = primaryCategory
    ? `Primary signal: ${primaryCategory[0]}.`
    : "No dominant signal category identified.";

  // Build disagreement sentence
  let disagreementSentence = "";
  const disagreementItems = getDisagreementItems(disagreements);
  if (disagreementItems.length > 0) {
    const hasActionMismatch = disagreementItems.some((d) => d.type === "Action Mismatch");
    if (hasActionMismatch && reviewCount > 0) {
      const reviewModels = actions.review.map(m => {
        const d = modelDisplay(m);
        return d.name;
      }).join(", ");
      disagreementSentence = `Notable disagreement: ${reviewModels} flagged for review only.`;
    } else if (hasActionMismatch && allowCount > 0) {
      const allowModels = actions.allow.map(m => {
        const d = modelDisplay(m);
        return d.name;
      }).join(", ");
      disagreementSentence = `Notable disagreement: ${allowModels} cleared this content.`;
    }
  }

  return [verdict, signalSentence, disagreementSentence].filter(Boolean).join(" ");
}

function highlightSummary(text) {
  if (!text) return text;
  let safe = escapeHtml(text);
  safe = safe.replace(/\b(remov\w*|flagged|violat\w*|harmful|danger\w*)\b/gi,
    '<span style="color: var(--red); font-style: normal; font-weight: 600;">$1</span>');
  safe = safe.replace(/\b(allow\w*|safe|clear\w*|approv\w*|acceptable)\b/gi,
    '<span style="color: var(--green); font-style: normal; font-weight: 600;">$1</span>');
  safe = safe.replace(/\b(review\w*|caution\w*|ambiguous|borderline|disagree\w*|conflict\w*)\b/gi,
    '<span style="color: var(--amber); font-style: normal; font-weight: 600;">$1</span>');
  return safe;
}

function renderExplainability(results, insights, disagreements, aiSummary) {
  const summary = aiSummary || generateConsensusSummary(results, insights, disagreements);
  if (!summary && !insights?.consensus_recommendation) {
    explainabilityList.innerHTML = "";
    return;
  }

  const consensusAction = insights?.consensus_recommendation || "No Consensus";
  const tone = actionTone(consensusAction);

  const disagreementItems = getDisagreementItems(disagreements);
  const topDisagreement = disagreementItems.length > 0 ? disagreementItems[0] : null;

  const footer = topDisagreement ? `
    <div class="consensus-footer">
      <span class="consensus-footer-label">PRIMARY SIGNAL</span>
      <span class="consensus-footer-type">${escapeHtml(topDisagreement.type)}</span>
      <span class="consensus-footer-desc">${escapeHtml(topDisagreement.description)}</span>
    </div>
  ` : "";

  explainabilityList.innerHTML = `
    <div class="consensus-summary">
      <div class="consensus-header">
        <span class="consensus-header-label">CONSENSUS</span>
        ${badge(consensusAction, tone)}
      </div>
      <div class="consensus-prose">${highlightSummary(summary)}</div>
      ${footer}
    </div>
  `;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Waiting for input", "loading");
  setAnalyzeLoading(true);
  batchSummary.classList.add("hidden");
  renderDisagreements([]);
  showPanelState("loading");

  const lowerTabsHide = document.getElementById('results-lower-tabs');
  if (lowerTabsHide) lowerTabsHide.classList.add('hidden');

  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    progressBar.classList.remove("hidden");
    progressBar.style.animation = "progress-bar 400ms ease";
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  lastAnalyzedText = payload.text || "";

  try {
    const data = await postJson("/analyze", payload);
    renderResults(data.results || []);
    renderDisagreements(data.disagreements || {});
    renderInsights(
      data.insights || {},
      data.results || [],
      selectedPlatform,
      {},
      data
    );
    renderExplainability(
      data.results || [],
      data.insights || {},
      data.disagreements || {},
      data.ai_analysis?.risk_narrative || ""
    );
    setHeroState(
      data.insights?.consensus_recommendation || "Review",
      generateConsensusSummary(data.results || [], data.insights || {}, data.disagreements || {})
    );
    // --- Donut Chart ---
    const activeResults = (data.results || []).filter((r) => !r.disabled && !r.error);
    const actionCounts = { remove: 0, review: 0, allow: 0 };
    activeResults.forEach(r => {
      const a = (r.action || '').toLowerCase();
      if (a === 'remove') actionCounts.remove++;
      else if (a === 'review') actionCounts.review++;
      else actionCounts.allow++;
    });
    const total = activeResults.length || 1;
    const circumference = 314.159;

    const removeArc = (actionCounts.remove / total) * circumference;
    const reviewArc = (actionCounts.review / total) * circumference;
    const allowArc  = (actionCounts.allow  / total) * circumference;

    const donutRemove = document.getElementById('donut-remove');
    const donutReview = document.getElementById('donut-review');
    const donutAllow  = document.getElementById('donut-allow');

    if (donutRemove) {
      donutRemove.style.strokeDasharray = removeArc + ' ' + circumference;
      donutRemove.style.strokeDashoffset = '0';
    }
    if (donutReview) {
      donutReview.style.strokeDasharray = reviewArc + ' ' + circumference;
      donutReview.style.strokeDashoffset = String(-removeArc);
    }
    if (donutAllow) {
      donutAllow.style.strokeDasharray = allowArc + ' ' + circumference;
      donutAllow.style.strokeDashoffset = String(-(removeArc + reviewArc));
    }

    const dominant = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])[0];
    const donutFraction = document.getElementById('donut-fraction');
    const donutLabel = document.getElementById('donut-action-label');
    if (donutFraction) donutFraction.textContent = dominant[1] + '/' + total;
    if (donutLabel) donutLabel.textContent = dominant[0].toUpperCase();

    // --- Severity Gauge ---
    const avgSeverity = activeResults.length
      ? Math.round(
          activeResults.reduce((sum, r) => sum + (r.severity || 0), 0) / activeResults.length
        )
      : 0;
    const gaugeNumber = document.getElementById('gauge-number');
    const gaugeFill = document.getElementById('gauge-fill-path');
    const gaugeColor = avgSeverity <= 3 ? 'var(--green)' :
                       avgSeverity <= 7 ? 'var(--amber)' : 'var(--red)';
    if (gaugeNumber) {
      gaugeNumber.textContent = avgSeverity;
      gaugeNumber.style.color = gaugeColor;
    }
    if (gaugeFill) {
      const fillLength = (avgSeverity / 10) * 188.5;
      gaugeFill.style.strokeDasharray = fillLength + ' 188.5';
      gaugeFill.style.stroke = gaugeColor;
    }

    showPanelState("results");
    setStatus("Analysis complete", "success");


    const lowerTabsEl2 = document.getElementById('results-lower-tabs');
    if (lowerTabsEl2) {
      lowerTabsEl2.classList.remove('hidden');
      document.querySelectorAll('.lower-tab')
        .forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.lower-panel')
        .forEach(p => p.classList.add('hidden'));
      const st = document.getElementById('lower-tab-summary');
      const sp = document.getElementById('lower-panel-summary');
      if (st) st.classList.add('active');
      if (sp) sp.classList.remove('hidden');
    }
  } catch (error) {
    renderResults([]);
    renderInsights({}, [], selectedPlatform, {}, {});
    explainabilityList.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
    setHeroState("Review", "");
    showPanelState("results");
    setStatus("Request failed", "error");
  } finally {
    setAnalyzeLoading(false);
    const progressBar = document.querySelector(".progress-bar");
    if (progressBar) progressBar.classList.add("hidden");
  }
});

exampleButtons.forEach((button) => {
  button.addEventListener("click", () => applyExample(button.dataset.category, button));
});

if (textInput) {
  textInput.addEventListener("input", updateCounter);
  textInput.addEventListener("animationend", () => textInput.classList.remove("example-loaded"));
}

updateCounter();
initializeModalSelects();
updateCustomPolicyVisibility();
updatePlatformPolicyBox("Reddit");

(function () {
  fetch("/models")
    .then((r) => r.json())
    .then((data) => {
      const el = document.getElementById("models-active-count");
      if (el && data.active_count != null) {
        el.textContent = data.active_count + " Models Available";
      }
    })
    .catch((err) => {
      console.warn("Failed to fetch model count:", err);
    });
})();
setHeroState("Review", "");
setPrimaryView("analysis");
showPanelState("empty");

(function() {
  function showPanel(id) {
    const workspace = document.querySelector('.workspace');
    const panels = ['benchmark-panel', 
      'how-it-works-panel', 'models-panel'];
    if (workspace) workspace.style.display = 'none';
    panels.forEach(p => {
      const el = document.getElementById(p);
      if (el) el.style.display = 'none';
    });
    if (id === 'workspace') {
      if (workspace) workspace.style.display = 'grid';
    } else {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    }
  }

  function setActiveNav(id) {
    document.querySelectorAll('.topbar-nav-item')
      .forEach(el => el.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  const navAnalysis = document.getElementById('nav-analysis');
  const navBenchmark = document.getElementById('nav-benchmark');
  const navHowItWorks = document.getElementById('nav-how-it-works');
  const navModels = document.getElementById('nav-models');

  if (navAnalysis) navAnalysis.addEventListener('click', () => {
    showPanel('workspace');
    setActiveNav('nav-analysis');
  });
  if (navBenchmark) navBenchmark.addEventListener('click', () => {
    showPanel('benchmark-panel');
    setActiveNav('nav-benchmark');
  });
  if (navHowItWorks) navHowItWorks.addEventListener('click', () => {
    showPanel('how-it-works-panel');
    setActiveNav('nav-how-it-works');
  });
  if (navModels) navModels.addEventListener('click', () => {
    showPanel('models-panel');
    setActiveNav('nav-models');
  });

  const explainerLink = document.getElementById('explainer-howtoworks-link');
  if (explainerLink) {
    explainerLink.addEventListener('click', (e) => {
      e.preventDefault();
      showPanel('how-it-works-panel');
      setActiveNav('nav-how-it-works');
    });
  }
})();
(function() {
  document.querySelectorAll('.lower-tab')
    .forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        document.querySelectorAll('.lower-tab')
          .forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.lower-panel')
          .forEach(p => p.classList.add('hidden'));
        tab.classList.add('active');
        const panel = document.getElementById(target);
        if (panel) panel.classList.remove('hidden');
      });
    });
})();
