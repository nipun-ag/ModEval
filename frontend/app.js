const form = document.getElementById("analyze-form");
const textInput = document.getElementById("text");
const charCounter = document.getElementById("char-counter");
const statusPill = document.getElementById("status-pill");
const resultsBody = document.getElementById("results-body");
const disagreementBanner = document.getElementById("disagreement-banner");
const explainabilityList = document.getElementById("explainability-list");
const strictestModel = document.getElementById("strictest-model");
const mostLenientModel = document.getElementById("most-lenient-model");
const batchButton = document.getElementById("batch-button");
const batchFileInput = document.getElementById("batch-file");
const batchSummary = document.getElementById("batch-summary");
const contextToggle = document.getElementById("context-toggle");
const contextContent = document.getElementById("context-content");
const analyzeButton = document.getElementById("analyze-button");
const workspace = document.querySelector(".workspace");
const benchmarkPanel = document.getElementById("benchmark-panel");

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
      const spaceBelow = viewportHeight - rect.bottom;

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
  "Perspective API",
  "Azure Content Safety",
  "AWS Comprehend",
  "Google NLP",
  "OpenAI Moderation",
];

const OPENSOURCE_MODELS = [
  "HuggingFace toxic-bert",
  "HuggingFace RoBERTa offensive",
  "HuggingFace Hate Speech",
  "HuggingFace Spam Detector",
  "HuggingFace Bias Detector",
];

const MODEL_DISPLAY = {
  "Perspective API": {
    name: "Perspective API",
    subtitle: "google/perspective",
    chip: "REST API",
  },
  "Azure Content Safety": {
    name: "Azure Content Safety",
    subtitle: "microsoft/azure",
    chip: "Proprietary",
  },
  "AWS Comprehend": {
    name: "AWS Comprehend",
    subtitle: "amazon/comprehend",
    chip: "Managed",
  },
  "Google NLP": {
    name: "Google NLP",
    subtitle: "google/nlp",
    chip: "REST API",
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
  "HuggingFace Spam Detector": {
    name: "Spam Detector",
    subtitle: "facebook/roberta-spam",
    chip: "RoBERTa",
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
let activeTab = "analysis";
let selectedPlatform = "Social Media";
let selectedContentType = "Original Post";
let selectedStrictness = "Balanced";

const STATE_MAP = {
  platform_context: (v) => { selectedPlatform = v; },
  content_type:     (v) => { selectedContentType = v; },
  strictness:       (v) => { selectedStrictness = v; },
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
    const labelText = fieldBlock ? fieldBlock.querySelector("label").textContent.trim() : "";
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
    if (initialSelected) hiddenInput.value = initialSelected.dataset.value;

    selectEl.querySelector(".custom-select-trigger").addEventListener("click", () => openModal(selectEl));
  });
}

function switchTab(tab) {
  // Legacy function - tabs now handled by topbar nav
  // Kept for backwards compatibility only
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

function renderResults(results) {
  if (!results.length) {
    resultsBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">No model output available.</td>
      </tr>
    `;
    return;
  }

  let html = "";

  // Enterprise APIs tier
  html += `<tr class="tier-header"><td colspan="6"><span class="tier-label">ENTERPRISE APIS</span></td></tr>`;
  ENTERPRISE_MODELS.forEach((modelName, index) => {
    const result = results.find(r => r.model === modelName);
    if (result) {
      if (result.disabled) {
        html += `
          <tr style="animation-delay:${index * 50}ms; opacity: 0.4;">
            <td colspan="6">
              <span class="metric-soft">${escapeHtml(modelName)} — Not Configured</span>
            </td>
          </tr>
        `;
      } else {
        html += `
          <tr style="animation-delay:${index * 50}ms">
            <td>
              ${renderModelDisplay(result.model, true)}
              <span class="metric-soft">${result.error ? "Model unavailable" : "Live inference"}</span>
            </td>
            <td>
              <span class="metric-strong">${escapeHtml(result.top_category)}</span>
            </td>
            <td>
              <span class="severity-value mono ${severityTone(Number(result.severity))}">${escapeHtml(result.severity)}</span>
            </td>
            <td>
              <span class="mono">${Number(result.confidence).toFixed(2)}</span>
            </td>
            <td class="action-cell">
              ${badge(result.action, actionTone(result.action))}
            </td>
          </tr>
        `;
      }
    }
  });

  // Open Source Models tier
  html += `<tr class="tier-header"><td colspan="6"><span class="tier-label">OPEN SOURCE MODELS</span></td></tr>`;
  OPENSOURCE_MODELS.forEach((modelName, index) => {
    const result = results.find(r => r.model === modelName);
    if (result) {
      if (result.disabled) {
        html += `
          <tr style="animation-delay:${(ENTERPRISE_MODELS.length + index) * 50}ms; opacity: 0.4;">
            <td colspan="6">
              <span class="metric-soft">${escapeHtml(modelName)} — Not Configured</span>
            </td>
          </tr>
        `;
      } else {
        html += `
          <tr style="animation-delay:${(ENTERPRISE_MODELS.length + index) * 50}ms">
            <td>
              ${renderModelDisplay(result.model, true)}
              <span class="metric-soft">${result.error ? "Model unavailable" : "Live inference"}</span>
            </td>
            <td>
              <span class="metric-strong">${escapeHtml(result.top_category)}</span>
            </td>
            <td>
              <span class="severity-value mono ${severityTone(Number(result.severity))}">${escapeHtml(result.severity)}</span>
            </td>
            <td>
              <span class="mono">${Number(result.confidence).toFixed(2)}</span>
            </td>
            <td class="action-cell">
              ${badge(result.action, actionTone(result.action))}
            </td>
          </tr>
        `;
      }
    }
  });

  resultsBody.innerHTML = html;
}

function renderDisagreements(disagreements) {
  if (!disagreements.length) {
    disagreementBanner.classList.add("hidden");
    disagreementBanner.classList.remove("visible");
    disagreementBanner.innerHTML = "";
    return;
  }

  const priorityOrder = ["Action Mismatch", "Severity Gap", "Category Mismatch"];
  const mostCritical = [...disagreements].sort(
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

function renderInsights(insights, results) {
  strictestModel.innerHTML = insights.strictest_model ? renderModelDisplay(insights.strictest_model) : "-";
  mostLenientModel.innerHTML = insights.most_lenient_model ? renderModelDisplay(insights.most_lenient_model) : "-";

  const strictestResult = results.find((result) => result.model === insights.strictest_model);
  const lenientResult = results.find((result) => result.model === insights.most_lenient_model);

  strictestCard.dataset.tone = actionTone(strictestResult?.action || "review");
  lenientCard.dataset.tone = actionTone(lenientResult?.action || "allow");
}

function generateInsight(action, confidence, flagged) {
  const tone = actionTone(action);
  const conf = parseFloat(confidence);
  const hasFlags = flagged && flagged.toLowerCase() !== "none" && flagged.trim() !== "";
  const category = hasFlags ? flagged : null;

  if (tone === "allow" && !hasFlags) {
    if (conf < 0.10) return "No harmful patterns detected. Content cleared across all checked categories.";
    return "No significant flags raised. Content appears safe for this platform context.";
  }

  if (tone === "allow" && hasFlags) {
    return `${capitalize(category)} detected but below removal threshold. Content allowed under current strictness settings.`;
  }

  if (tone === "review") {
    if (hasFlags) return `${capitalize(category)} patterns present but inconclusive. Recommend human review before action.`;
    return "Ambiguous signal. No dominant category flagged — manual review advised.";
  }

  if (tone === "remove" && hasFlags && conf >= 0.80) {
    return `Strong ${category} signal detected with high confidence. Automatic removal recommended.`;
  }

  if (tone === "remove" && hasFlags && conf < 0.80) {
    return `${capitalize(category)} patterns detected. Confidence is moderate — removal flagged but human review may refine this.`;
  }

  if (tone === "remove" && !hasFlags) {
    return "Model flagged this content for removal based on combined signal patterns, though no single dominant category was identified.";
  }

  return "Insufficient signal to generate a clear interpretation.";
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateConsensusSummary(results, insights, disagreements) {
  if (!results || results.length === 0) return "";

  const total = results.length;
  const actions = { allow: [], review: [], remove: [] };
  results.forEach(r => {
    const tone = actionTone(r.action);
    if (actions[tone]) actions[tone].push(r.model);
  });

  const removeCount = actions.remove.length;
  const reviewCount = actions.review.length;
  const allowCount = actions.allow.length;
  const consensus = insights?.consensus_action || "";

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
  results.forEach(r => {
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
  if (disagreements && disagreements.length > 0) {
    const hasActionMismatch = disagreements.some(d => d.type === "Action Mismatch");
    if (hasActionMismatch && reviewCount > 0) {
      const reviewModels = actions.review.map(m => {
        const d = modelDisplay(m);
        return d.title;
      }).join(", ");
      disagreementSentence = `Notable disagreement: ${reviewModels} flagged for review only.`;
    } else if (hasActionMismatch && allowCount > 0) {
      const allowModels = actions.allow.map(m => {
        const d = modelDisplay(m);
        return d.title;
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
  if (!summary && !insights.consensus_action) {
    explainabilityList.innerHTML = "";
    return;
  }

  const consensusAction = insights?.consensus_action || "No Consensus";
  const tone = actionTone(consensusAction);

  const topDisagreement = disagreements && disagreements.length > 0 ? disagreements[0] : null;

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
  payload.policy = selectedPlatform;

  try {
    const data = await postJson("/analyze", payload);
    const activeModels = (data.results || []).filter(r => !r.disabled).length;
    const modelsCountSpan = document.getElementById('models-active-count');
    if (modelsCountSpan) {
      modelsCountSpan.textContent = activeModels + ' Models Active';
    }
    renderResults(data.results || []);
    renderDisagreements(data.disagreements || []);
    renderInsights(data.insights || {}, data.results || []);
    renderExplainability(data.results || [], data.insights || {}, data.disagreements || [], data.ai_summary || "");
    setHeroState(
      data.insights?.consensus_recommendation || data.insights?.consensus_action || "Review",
      data.ai_summary || generateConsensusSummary(data.results || [], data.insights || {}, data.disagreements || [])
    );
    // --- Donut Chart ---
    const activeResults = data.results.filter(r => !r.disabled);
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
    const avgSeverity = Math.round(
      data.results.reduce((sum, r) => sum + (r.severity || 0), 0) 
      / data.results.length
    );
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
    renderInsights({}, []);
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

if (batchButton) batchButton.addEventListener("click", () => batchFileInput.click());
exampleButtons.forEach((button) => {
  button.addEventListener("click", () => applyExample(button.dataset.category, button));
});

if (batchFileInput) batchFileInput.addEventListener("change", async () => {
  const [file] = batchFileInput.files;
  if (!file) {
    return;
  }

  setStatus("Waiting for input", "loading");

  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    progressBar.classList.remove("hidden");
    progressBar.style.animation = "progress-bar 400ms ease";
  }

  try {
    const csvText = await file.text();
    const inputs = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      ...Object.fromEntries(new FormData(form).entries()),
      inputs,
    };

    const data = await postJson("/batch-analyze", payload);
    batchSummary.classList.remove("hidden");
    batchSummary.innerHTML = `
      <strong>Batch Summary</strong>
      <p>Total inputs: ${data.total} | Flagged inputs: ${data.flagged_count} | Flag rate: ${(data.flag_rate * 100).toFixed(1)}%</p>
    `;
    setStatus("Analysis complete", "success");
  } catch (error) {
    batchSummary.classList.remove("hidden");
    batchSummary.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
    setStatus("Request failed", "error");
  } finally {
    const progressBar = document.querySelector(".progress-bar");
    if (progressBar) progressBar.classList.add("hidden");
    if (batchFileInput) batchFileInput.value = "";
  }
});

// Ensure any other references to lower tab IDs are null-checked
const lowerPanelSummary = document.getElementById('lower-panel-summary');
if (lowerPanelSummary) {
  // Any operations on lowerPanelSummary go here
}
const lowerPanelBreakdown = document.getElementById('lower-panel-breakdown');
if (lowerPanelBreakdown) {
  // Any operations on lowerPanelBreakdown go here
}
const lowerPanelInsights = document.getElementById('lower-panel-insights');
if (lowerPanelInsights) {
  // Any operations on lowerPanelInsights go here
}

if (textInput) {
  textInput.addEventListener("input", updateCounter);
  textInput.addEventListener("animationend", () => textInput.classList.remove("example-loaded"));
}
if (contextToggle) {
  contextToggle.addEventListener("click", () => {
    const expanded = contextToggle.getAttribute("aria-expanded") === "true";
    setSectionExpanded(contextToggle, contextContent, !expanded);
  });
}

window.addEventListener("resize", () => {
  [contextContent].forEach((content) => {
    if (content.classList.contains("expanded")) {
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
});

updateCounter();
initializeModalSelects();
setSectionExpanded(contextToggle, contextContent, false);
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
