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
const policyToggleIndicator = document.getElementById("policy-toggle-indicator");

const POLICY_GUIDELINES = {
  "Reddit": [
    "Do not post content that encourages or incites violence",
    "Do not harass, bully, or threaten individuals",
    "Do not post personal information of others without consent",
    "Do not sexualize minors in any way",
    "Do not post content that promotes hate based on identity or vulnerability",
    "Spam and vote manipulation are prohibited",
  ],
  "Discord": [
    "Do not make threats of violence against people or animals",
    "Do not harass or bully other users",
    "Do not share content that sexualizes minors",
    "Do not promote or glorify self-harm or suicide",
    "Do not coordinate hate speech or discriminatory content",
    "Do not share false or misleading information that causes harm",
  ],
  "Facebook": [
    "Do not post content that incites violence or hate against protected groups",
    "Do not bully, harass, or threaten private individuals",
    "Do not share content that exploits or sexualizes children",
    "Do not post graphic violence meant to shock or disgust",
    "Do not create fake accounts or impersonate others",
    "Do not coordinate harm or promote terrorist organizations",
  ],
  "Instagram": [
    "Do not post content that promotes violence or hate speech",
    "Do not bully or harass individuals, especially minors",
    "Do not share content that sexualizes anyone, especially minors",
    "Do not post graphic or gory content",
    "Do not share misinformation that could cause real-world harm",
    "Do not impersonate other people or organizations",
  ],
  "Custom": [
    "No predefined guidelines — your custom policy rules apply",
  ],
};

function setStatus(message, state) {
  statusPill.textContent = message;
  statusPill.className = `status-pill ${state}`;
}

function updateCounter() {
  charCounter.textContent = `${textInput.value.length} / 500`;
}

function toggleCustomPolicy() {
  customPolicyWrap.classList.toggle("hidden", policySelect.value !== "Custom");
}

function renderPolicyGuidelines() {
  const guidelines = POLICY_GUIDELINES[policySelect.value] || [];
  policyGuidelines.innerHTML = guidelines.map((guideline) => `<li>${guideline}</li>`).join("");
}

function setPolicyCardExpanded(expanded) {
  policyToggle.setAttribute("aria-expanded", String(expanded));
  policyContent.classList.toggle("hidden", !expanded);
  policyToggleIndicator.textContent = expanded ? "−" : "+";
}

function badge(label, variant) {
  return `<span class="badge ${variant}">${label}</span>`;
}

function renderResults(results) {
  if (!results.length) {
    resultsBody.innerHTML = `<tr class="empty-row"><td colspan="6">No results available.</td></tr>`;
    return;
  }

  resultsBody.innerHTML = results.map((result) => `
    <tr>
      <td data-label="Model">${result.model}</td>
      <td data-label="Top Category">${result.top_category}</td>
      <td data-label="Severity">${result.severity}</td>
      <td data-label="Confidence" class="mono">${Number(result.confidence).toFixed(2)}</td>
      <td data-label="Action">${badge(result.action, result.action.toLowerCase())}</td>
      <td data-label="Policy Alignment">
        ${badge(result.aligned ? "Aligned" : "Misaligned", result.aligned ? "aligned" : "misaligned")}
        <div class="mono">${Number(result.alignment_score || 0).toFixed(2)}</div>
        ${result.error ? `<div class="error-text">${result.error}</div>` : ""}
      </td>
    </tr>
  `).join("");
}

function renderDisagreements(disagreements) {
  if (!disagreements.length) {
    disagreementBanner.classList.add("hidden");
    disagreementBanner.innerHTML = "";
    return;
  }

  disagreementBanner.classList.remove("hidden");
  disagreementBanner.innerHTML = disagreements.map((item) => `<p>${item.description}</p>`).join("");
}

function renderInsights(insights) {
  strictestModel.textContent = insights.strictest_model || "-";
  mostLenientModel.textContent = insights.most_lenient_model || "-";
  consensusAction.textContent = insights.consensus_action || "-";
}

function renderExplainability(results) {
  explainabilityList.innerHTML = results.map((result, index) => `
    <article class="accordion-item">
      <button class="accordion-trigger" type="button" aria-expanded="${index === 0 ? "true" : "false"}">
        <span>${result.model}</span>
        <span>${result.action}</span>
      </button>
      <div class="accordion-content ${index === 0 ? "" : "hidden"}">
        <p>${result.explanation}</p>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const content = trigger.nextElementSibling;
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      content.classList.toggle("hidden", expanded);
    });
  });
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
  batchSummary.classList.add("hidden");

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const data = await postJson("/analyze", payload);
    renderResults(data.results || []);
    renderDisagreements(data.disagreements || []);
    renderInsights(data.insights || {});
    renderExplainability(data.results || []);
    setStatus("Analysis complete", "success");
  } catch (error) {
    renderResults([]);
    renderDisagreements([]);
    renderInsights({});
    explainabilityList.innerHTML = `<p class="error-text">${error.message}</p>`;
    setStatus("Request failed", "error");
  }
});

batchButton.addEventListener("click", () => batchFileInput.click());

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
      <strong>Batch summary</strong>
      <p>Total inputs: ${data.total} | Flagged inputs: ${data.flagged_count} | Flag rate: ${(data.flag_rate * 100).toFixed(1)}%</p>
    `;
    setStatus("Batch analysis complete", "success");
  } catch (error) {
    batchSummary.classList.remove("hidden");
    batchSummary.innerHTML = `<p class="error-text">${error.message}</p>`;
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
  setPolicyCardExpanded(!expanded);
});

updateCounter();
toggleCustomPolicy();
renderPolicyGuidelines();
setPolicyCardExpanded(false);
