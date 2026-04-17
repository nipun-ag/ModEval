const form = document.getElementById("analyze-form");
const textInput = document.getElementById("text");
const charCounter = document.getElementById("char-counter");
const policySelect = document.getElementById("policy");
const customPolicyWrap = document.getElementById("custom-policy-wrap");
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
const policyToggle = document.getElementById("policy-toggle");
const policyContent = document.getElementById("policy-content");
const policyGuidelines = document.getElementById("policy-guidelines");
const policyCitation = document.getElementById("policy-citation");
const contextToggle = document.getElementById("context-toggle");
const contextContent = document.getElementById("context-content");
const analyzeButton = document.getElementById("analyze-button");
const analyzeSpinner = document.getElementById("analyze-spinner");
const resultsEmpty = document.getElementById("results-empty");
const resultsContent = document.getElementById("results-content");
const strictestCard = document.getElementById("strictest-card");
const lenientCard = document.getElementById("lenient-card");
const consensusCard = document.getElementById("consensus-card");
const exampleButtons = Array.from(document.querySelectorAll(".example-pill"));

const MODEL_DISPLAY = {
  "HuggingFace toxic-bert": {
    name: "Toxicity Classifier",
    subtitle: "unitary/toxic-bert",
  },
  "HuggingFace RoBERTa offensive": {
    name: "Offensive Language Detector",
    subtitle: "cardiffnlp/roberta-offensive",
  },
  "HuggingFace Hate Speech": {
    name: "Hate Speech Detector",
    subtitle: "facebook/roberta-hate-speech",
  },
  "HuggingFace Spam Detector": {
    name: "Spam Detector",
    subtitle: "mrm8488/bert-tiny",
  },
  "HuggingFace Bias Detector": {
    name: "Bias Detector",
    subtitle: "valurank/distilroberta-bias",
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
};

const lastExampleByCategory = {};

const POLICY_GUIDELINES = {
  Reddit: [
    "Do not post content that incites or glorifies violence against people or animals",
    "Do not harass, bully, threaten, or intimidate other users",
    "Do not share or encourage sexual or suggestive content involving minors",
    "Do not reveal personal information of others without their consent (doxxing)",
    "Do not impersonate individuals, organizations, or Reddit itself",
    "Do not post illegal content or facilitate illegal transactions",
    "Do not manipulate votes or engage in spam",
    "Abide by the rules of each community you participate in",
  ],
  Discord: [
    "Do not promote, coordinate, or engage in harassment or sexual harassment",
    "Do not threaten to harm another individual or group of people",
    "Do not share or threaten to share personally identifiable information without consent (doxxing)",
    "Do not use hate speech or engage in hateful conduct based on protected characteristics",
    "Do not organize, promote, or support violent extremism",
    "Do not share content that sexually exploits or endangers minors",
    "Do not promote, glorify, or provide instructions for self-harm or suicide",
    "Do not share false or misleading information that causes real-world harm",
  ],
  Facebook: [
    "Do not post content that incites or facilitates violence against people or animals",
    "Do not bully, harass, or threaten private individuals",
    "Do not post content that sexually exploits or endangers children",
    "Do not post graphic violence intended to shock or glorify harm",
    "Do not engage in hate speech targeting people based on protected characteristics",
    "Do not create fake accounts or impersonate others",
    "Do not coordinate inauthentic behavior or run influence operations",
    "Do not facilitate or promote terrorism or organized crime",
  ],
  Instagram: [
    "Do not post content that promotes violence or incites harm against others",
    "Do not bully or harass individuals, with extra protection for minors",
    "Do not share content that sexually exploits or endangers children",
    "Do not post graphic or gory content intended to shock",
    "Do not engage in hate speech based on protected characteristics",
    "Do not share health misinformation or content that causes real-world harm",
    "Do not impersonate other people or organizations",
    "Authentic identity is not required but coordinated inauthentic behavior is prohibited",
  ],
  Custom: [
    "No predefined guidelines - your custom policy rules apply",
  ],
};

const POLICY_CITATIONS = {
  Reddit: {
    label: "Source: Reddit Content Policy",
    url: "https://redditinc.com/policies/content-policy",
    suffix: "redditinc.com/policies/content-policy",
  },
  Discord: {
    label: "Source: Discord Community Guidelines",
    url: "https://discord.com/guidelines",
    suffix: "discord.com/guidelines (Effective September 29, 2025)",
  },
  Facebook: {
    label: "Source: Meta Community Standards",
    url: "https://transparency.meta.com/policies/community-standards",
    suffix: "transparency.meta.com/policies/community-standards",
  },
  Instagram: {
    label: "Source: Meta Community Standards (unified)",
    url: "https://transparency.meta.com/policies/community-standards",
    suffix: "transparency.meta.com/policies/community-standards",
  },
};

function setStatus(message, state) {
  statusPill.textContent = message;
  statusPill.className = `status-pill ${state}`;
}

function setAnalyzeLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeSpinner.classList.toggle("hidden", !isLoading);
  analyzeButton.querySelector(".button-label").textContent = isLoading ? "Analyzing" : "Analyze";
}

function updateCounter() {
  charCounter.textContent = `${textInput.value.length} / 500`;
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
  window.setTimeout(() => button.classList.remove("active"), 650);
}

function toggleCustomPolicy() {
  customPolicyWrap.classList.toggle("hidden", policySelect.value !== "Custom");
}

function setSectionExpanded(toggle, content, expanded) {
  toggle.setAttribute("aria-expanded", String(expanded));
  content.classList.toggle("hidden", !expanded);
}

function renderPolicyGuidelines() {
  const guidelines = POLICY_GUIDELINES[policySelect.value] || [];
  const citation = POLICY_CITATIONS[policySelect.value];
  policyGuidelines.innerHTML = guidelines.map((guideline) => `<li>${guideline}</li>`).join("");

  if (citation) {
    policyCitation.classList.remove("hidden");
    policyCitation.innerHTML = `${citation.label} - <a href="${citation.url}" target="_blank" rel="noreferrer">${citation.suffix}</a>`;
  } else {
    policyCitation.classList.add("hidden");
    policyCitation.innerHTML = "";
  }
}

function badge(label, variant) {
  return `<span class="badge ${variant}">${label}</span>`;
}

function modelDisplay(modelName) {
  return MODEL_DISPLAY[modelName] || { name: modelName, subtitle: "" };
}

function renderModelDisplay(modelName) {
  const display = modelDisplay(modelName);
  const subtitle = display.subtitle
    ? `<span class="model-subtitle mono">${escapeHtml(display.subtitle)}</span>`
    : "";
  return `<span class="model-title">${escapeHtml(display.name)}</span>${subtitle}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

function showResults(hasResults) {
  resultsEmpty.classList.toggle("hidden", hasResults);
  resultsContent.classList.toggle("hidden", !hasResults);
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
    <tr data-action="${escapeHtml(result.action)}" style="animation-delay:${index * 90}ms">
      <td data-label="Model" class="model-cell">
        <strong>${renderModelDisplay(result.model)}</strong>
        <span class="metric-soft">${result.error ? "Model unavailable" : "Live inference"}</span>
      </td>
      <td data-label="Top Category">
        <span class="metric-strong">${escapeHtml(result.top_category)}</span>
      </td>
      <td data-label="Severity">
        <span class="metric-strong mono">${escapeHtml(result.severity)}</span>
      </td>
      <td data-label="Confidence">
        <span class="metric-strong mono">${Number(result.confidence).toFixed(2)}</span>
      </td>
      <td data-label="Action" class="action-cell">
        ${badge(result.action, actionTone(result.action))}
      </td>
      <td data-label="Policy Alignment">
        <div class="metric-inline">
          ${badge(result.aligned ? "Aligned" : "Misaligned", result.aligned ? "aligned" : "misaligned")}
          <span class="separator">/</span>
          <span class="mono">${Number(result.alignment_score || 0).toFixed(2)}</span>
        </div>
        ${result.error ? `<div class="metric-soft error-text">${escapeHtml(result.error)}</div>` : ""}
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

  const displayType = mostCritical.type === "Action Mismatch"
    ? "final recommendation"
    : mostCritical.type === "Severity Gap"
      ? "severity assessment"
      : "primary risk category";

  const mentionedModels = Array.from(new Set(
    Object.keys(MODEL_DISPLAY).filter((model) => mostCritical.description.includes(model))
  ));
  const modelSummary = mentionedModels.length
    ? ` <span class="metric-soft">${mentionedModels.map((model) => modelDisplay(model).name).join(" vs ")}</span>`
    : "";

  disagreementBanner.innerHTML = `
    <span class="warning-icon">⚠</span>
    <span>${messages[mostCritical.type] || escapeHtml(mostCritical.description)}${modelSummary ? ` - ${displayType}` : ""}${modelSummary}</span>
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

  strictestCard.dataset.tone = actionTone(strictestResult?.action || "Review");
  lenientCard.dataset.tone = actionTone(lenientResult?.action || "Allow");
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
  setStatus("Analyzing", "loading");
  setAnalyzeLoading(true);
  batchSummary.classList.add("hidden");

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const data = await postJson("/analyze", payload);
    showResults(true);
    renderResults(data.results || []);
    renderDisagreements(data.disagreements || []);
    renderInsights(data.insights || {}, data.results || []);
    renderExplainability(data.results || []);
    setStatus("Analysis complete", "success");
  } catch (error) {
    showResults(true);
    renderResults([]);
    renderDisagreements([]);
    renderInsights({}, []);
    explainabilityList.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
    setStatus("Request failed", "error");
  } finally {
    setAnalyzeLoading(false);
  }
});

batchButton.addEventListener("click", () => batchFileInput.click());
exampleButtons.forEach((button) => {
  button.addEventListener("click", () => applyExample(button.dataset.category, button));
});

batchFileInput.addEventListener("change", async () => {
  const [file] = batchFileInput.files;
  if (!file) {
    return;
  }

  setStatus("Running batch analysis", "loading");

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
    setStatus("Batch analysis complete", "success");
  } catch (error) {
    batchSummary.classList.remove("hidden");
    batchSummary.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
    setStatus("Batch request failed", "error");
  } finally {
    batchFileInput.value = "";
  }
});

textInput.addEventListener("input", updateCounter);
policySelect.addEventListener("change", toggleCustomPolicy);
policySelect.addEventListener("change", renderPolicyGuidelines);
policyToggle.addEventListener("click", () => {
  const expanded = policyToggle.getAttribute("aria-expanded") === "true";
  setSectionExpanded(policyToggle, policyContent, !expanded);
});
contextToggle.addEventListener("click", () => {
  const expanded = contextToggle.getAttribute("aria-expanded") === "true";
  setSectionExpanded(contextToggle, contextContent, !expanded);
});
textInput.addEventListener("animationend", () => textInput.classList.remove("example-loaded"));

updateCounter();
toggleCustomPolicy();
renderPolicyGuidelines();
setSectionExpanded(policyToggle, policyContent, false);
setSectionExpanded(contextToggle, contextContent, false);
showResults(false);
