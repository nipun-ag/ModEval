const form = document.getElementById("analyze-form");
const textInput = document.getElementById("text");
const charCounter = document.getElementById("char-counter");
const statusPill = document.getElementById("status-pill");
const resultsBody = document.getElementById("results-body");
const disagreementBanner = document.getElementById("disagreement-banner");
const explainabilityList = document.getElementById("explainability-list");
const strictestModel = document.getElementById("strictest-model");
const mostLenientModel = document.getElementById("most-lenient-model");
const consensusAction = document.getElementById("consensus-action");
const batchButton = document.getElementById("batch-button");
const batchFileInput = document.getElementById("batch-file");
const batchSummary = document.getElementById("batch-summary");
const analysisTab = document.getElementById("analysis-tab");
const methodologyTab = document.getElementById("methodology-tab");
const didYouKnowTab = document.getElementById("did-you-know-tab");
const analysisView = document.getElementById("analysis-view");
const methodologyView = document.getElementById("methodology-view");
const didYouKnowView = document.getElementById("did-you-know-view");
const platformContextSelect = document.getElementById("platform-context-select");
const platformContextInput = document.getElementById("platform_context");
const platformContextTrigger = document.getElementById("platform-context-trigger");
const platformContextTriggerLabel = document.getElementById("platform-context-trigger-label");
const platformContextPanel = document.getElementById("platform-context-panel");
const platformContextOptions = Array.from(document.querySelectorAll(".custom-select-option"));
const contextToggle = document.getElementById("context-toggle");
const contextContent = document.getElementById("context-content");
const analyzeButton = document.getElementById("analyze-button");
const resultsEmpty = document.getElementById("results-empty");
const skeletonState = document.getElementById("skeleton-state");
const resultsContent = document.getElementById("results-content");
const strictestCard = document.getElementById("strictest-card");
const lenientCard = document.getElementById("lenient-card");
const consensusCard = document.getElementById("consensus-card");
const exampleButtons = Array.from(document.querySelectorAll(".example-pill"));

const MODEL_DISPLAY = {
  "HuggingFace toxic-bert": {
    name: "Toxicity Classifier",
    subtitle: "unitary/toxic-bert",
    chip: "BERT",
  },
  "HuggingFace RoBERTa offensive": {
    name: "Offensive Language Detector",
    subtitle: "cardiffnlp/roberta-offensive",
    chip: "RoBERTa",
  },
  "HuggingFace Hate Speech": {
    name: "Hate Speech Detector",
    subtitle: "facebook/roberta-hate-speech",
    chip: "facebook",
  },
  "HuggingFace Spam Detector": {
    name: "Spam Detector",
    subtitle: "mrm8488/bert-tiny",
    chip: "mrm8488",
  },
  "HuggingFace Bias Detector": {
    name: "Bias Detector",
    subtitle: "valurank/distilroberta-bias",
    chip: "valurank",
  },
};

const EXAMPLE_LIBRARY = {
  Toxicity: [
    "You are absolutely pathetic and worthless, nobody wants you here",
    "What the fuck is wrong with you, are you actually this stupid",
    "Nobody likes you, just disappear already you miserable loser",
    "You're a complete waste of space and everyone fucking knows it",
    "Shut your stupid mouth before someone shuts it for you",
    "You're too damn dumb to understand anything, just give up already",
    "Go crawl back under the rock you came from you piece of shit",
    "You disgust me, you absolute brain-dead moron",
    "People like you make this world a worse place to live in",
    "You're a joke and everyone around you is laughing behind your back",
  ],
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
}

function setAnalyzeLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.classList.toggle("loading", isLoading);
  analyzeButton.querySelector(".button-label").textContent = isLoading ? "Analyzing..." : "Execute Analysis";
}

function setPlatformContextOpen(isOpen) {
  platformContextTrigger.setAttribute("aria-expanded", String(isOpen));
  platformContextPanel.classList.toggle("hidden", !isOpen);
}

function selectPlatformContext(value) {
  const selectedOption = platformContextOptions.find((option) => option.dataset.value === value);
  if (!selectedOption) {
    return;
  }

  selectedPlatform = value;
  platformContextInput.value = value;
  platformContextTriggerLabel.textContent = selectedOption.querySelector(".custom-select-name").textContent;
  platformContextOptions.forEach((option) => {
    option.classList.toggle("selected", option === selectedOption);
  });
  setPlatformContextOpen(false);
}

function switchTab(nextTab) {
  if (activeTab === nextTab) {
    return;
  }

  const views = { analysis: analysisView, methodology: methodologyView, didYouKnow: didYouKnowView };
  const buttons = { analysis: analysisTab, methodology: methodologyTab, didYouKnow: didYouKnowTab };

  const currentView = views[activeTab];
  const nextView = views[nextTab];
  const currentButton = buttons[activeTab];
  const nextButton = buttons[nextTab];

  currentView.classList.add("fading");
  window.setTimeout(() => {
    currentView.classList.add("hidden");
    currentView.classList.remove("fading", "active");
    if (nextView) {
      nextView.classList.remove("hidden");
      nextView.classList.add("fading");
      void nextView.offsetWidth;
      nextView.classList.add("active");
      nextView.classList.remove("fading");
      nextView.scrollTop = 0;
    }
  }, 150);

  currentButton.classList.remove("active");
  currentButton.setAttribute("aria-selected", "false");
  if (nextButton) {
    nextButton.classList.add("active");
    nextButton.setAttribute("aria-selected", "true");
  }
  activeTab = nextTab;
}

function updateCounter() {
  charCounter.textContent = `${textInput.value.length} / 500`;
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

  resultsBody.innerHTML = results.map((result, index) => `
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
      <td class="alignment-cell">
        <div class="alignment-inline">
          <span class="alignment-icon ${result.aligned ? "aligned" : "misaligned"}">${result.aligned ? "✓" : "×"}</span>
          ${badge(result.aligned ? "Aligned" : "Misaligned", result.aligned ? "aligned" : "misaligned")}
          <span class="mono">${Number(result.alignment_score || 0).toFixed(2)}</span>
        </div>
        ${result.error ? `<span class="metric-soft error-text">${escapeHtml(result.error)}</span>` : ""}
      </td>
    </tr>
  `).join("");
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
  consensusAction.textContent = insights.consensus_action || "-";

  const strictestResult = results.find((result) => result.model === insights.strictest_model);
  const lenientResult = results.find((result) => result.model === insights.most_lenient_model);

  strictestCard.dataset.tone = actionTone(strictestResult?.action || "review");
  lenientCard.dataset.tone = actionTone(lenientResult?.action || "allow");
  consensusCard.dataset.tone = actionTone(insights.consensus_action || "neutral");
}

function renderExplainability(results) {
  explainabilityList.innerHTML = results.map((result) => `
    <article class="explanation-card">
      <div class="explanation-head">
        <h4>${renderModelDisplay(result.model)}</h4>
        ${badge(result.action, actionTone(result.action))}
      </div>
      <p class="explanation-text">${escapeHtml(result.explanation || "No explanation available.")}</p>
    </article>
  `).join("");
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

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const data = await postJson("/analyze", payload);
    renderResults(data.results || []);
    renderDisagreements(data.disagreements || []);
    renderInsights(data.insights || {}, data.results || []);
    renderExplainability(data.results || []);
    showPanelState("results");
    setStatus("Analysis complete", "success");
  } catch (error) {
    renderResults([]);
    renderInsights({}, []);
    explainabilityList.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
    showPanelState("results");
    setStatus("Request failed", "error");
  } finally {
    setAnalyzeLoading(false);
  }
});

batchButton.addEventListener("click", () => batchFileInput.click());
analysisTab.addEventListener("click", () => switchTab("analysis"));
methodologyTab.addEventListener("click", () => switchTab("methodology"));
didYouKnowTab.addEventListener("click", () => switchTab("didYouKnow"));
platformContextTrigger.addEventListener("click", () => {
  const expanded = platformContextTrigger.getAttribute("aria-expanded") === "true";
  setPlatformContextOpen(!expanded);
});
platformContextOptions.forEach((option) => {
  option.addEventListener("click", () => selectPlatformContext(option.dataset.value));
});
exampleButtons.forEach((button) => {
  button.addEventListener("click", () => applyExample(button.dataset.category, button));
});

batchFileInput.addEventListener("change", async () => {
  const [file] = batchFileInput.files;
  if (!file) {
    return;
  }

  setStatus("Waiting for input", "loading");

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
    batchFileInput.value = "";
  }
});

textInput.addEventListener("input", updateCounter);
textInput.addEventListener("animationend", () => textInput.classList.remove("example-loaded"));
contextToggle.addEventListener("click", () => {
  const expanded = contextToggle.getAttribute("aria-expanded") === "true";
  setSectionExpanded(contextToggle, contextContent, !expanded);
});

window.addEventListener("resize", () => {
  [contextContent].forEach((content) => {
    if (content.classList.contains("expanded")) {
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
});

document.addEventListener("click", (event) => {
  if (!platformContextSelect.contains(event.target)) {
    setPlatformContextOpen(false);
  }
});

updateCounter();
selectPlatformContext(platformContextInput.value);
setSectionExpanded(contextToggle, contextContent, false);
showPanelState("empty");
