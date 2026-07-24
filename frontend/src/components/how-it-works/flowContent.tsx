import type { ReactNode } from "react"
import { MODEL_CATALOG } from "@/data/modelCatalog"

export type FlowNodeId =
  | "input"
  | "context"
  | "parallel"
  | "normalize"
  | "align"
  | "disagree"
  | "insights"
  | "ai-interpretation"
  | "response"
  | "why-models"
  | "limitations"
  | `model:${string}`

export type FlowNodeMeta = {
  id: FlowNodeId
  title: string
  eyebrow: string
}

export const MODEL_LANES = [
  { key: "hive", label: "Hive", catalogId: "Hive Moderation" },
  { key: "azure", label: "Azure", catalogId: "Azure Content Safety" },
  { key: "google", label: "Google NLP", catalogId: "Google NLP" },
  { key: "openai", label: "OpenAI", catalogId: "OpenAI Moderation" },
  { key: "toxic", label: "toxic-bert", catalogId: "HuggingFace toxic-bert" },
  { key: "offensive", label: "RoBERTa Off.", catalogId: "HuggingFace RoBERTa offensive" },
  { key: "hate", label: "Hate Speech", catalogId: "HuggingFace Hate Speech" },
  { key: "bias", label: "Bias", catalogId: "HuggingFace Bias Detector" },
] as const

const PLATFORM_ROWS: [string, string][] = [
  ["Reddit", "Reddit content policy rules"],
  ["Discord", "Discord community guidelines"],
  ["Facebook", "Meta Community Standards"],
  ["Instagram", "Meta Community Standards (unified)"],
  ["Custom", "User-defined policy notes"],
]

function SchemaBlock() {
  return (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-border/70 bg-background/70 p-4 font-mono text-xs text-platinum">
{`{
  model: string,
  top_category: string,
  confidence: number (0-1),
  action: "Allow" | "Review" | "Remove",
  flagged: boolean
}`}
    </pre>
  )
}

function ModelDetail({ catalogId }: { catalogId: string }) {
  const model = MODEL_CATALOG.find((entry) => entry.id === catalogId)
  if (!model) {
    return <p>Model details unavailable.</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
          {model.arch} · {model.tier === "enterprise" ? "Enterprise API" : "Open Source"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{model.creator}</p>
      </div>
      <p className="text-sm text-foreground/90">Detects: {model.detects}</p>
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground/80">Trained on</strong> {model.trained}
      </p>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Strengths
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {model.strengths.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Limitations
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {model.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <a
        href={model.link}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm text-primary hover:underline"
      >
        {model.linkLabel}
      </a>
    </div>
  )
}

export function getFlowNodeMeta(id: FlowNodeId): FlowNodeMeta {
  if (id.startsWith("model:")) {
    const catalogId = id.slice("model:".length)
    const lane = MODEL_LANES.find((item) => item.catalogId === catalogId)
    const model = MODEL_CATALOG.find((entry) => entry.id === catalogId)
    return {
      id,
      title: model?.name ?? lane?.label ?? "Model",
      eyebrow: "Parallel Inference · Model Lane",
    }
  }

  const map: Record<Exclude<FlowNodeId, `model:${string}`>, FlowNodeMeta> = {
    input: { id: "input", title: "Input", eyebrow: "Stage 01 · Entry" },
    context: { id: "context", title: "Context Engine", eyebrow: "Stage 02 · Thresholds & Policy" },
    parallel: {
      id: "parallel",
      title: "Parallel Inference",
      eyebrow: "Stage 03 · Fan-out / Fan-in",
    },
    normalize: {
      id: "normalize",
      title: "Unified Output Normalization",
      eyebrow: "Stage 04 · Schema",
    },
    align: {
      id: "align",
      title: "Policy Alignment Engine",
      eyebrow: "Stage 05 · Claude Haiku",
    },
    disagree: {
      id: "disagree",
      title: "Disagreement Detection",
      eyebrow: "Stage 06 · Signal Surface",
    },
    insights: {
      id: "insights",
      title: "Insights Aggregation",
      eyebrow: "Stage 07 · build_insights()",
    },
    "ai-interpretation": {
      id: "ai-interpretation",
      title: "AI Interpretation Layer",
      eyebrow: "Stage 08 · Synthesis",
    },
    response: { id: "response", title: "Response", eyebrow: "Stage 09 · JSON → UI" },
    "why-models": {
      id: "why-models",
      title: "Why These Models",
      eyebrow: "Companion · Annotates Parallel Inference",
    },
    limitations: {
      id: "limitations",
      title: "Known Limitations",
      eyebrow: "Companion · Outside Sequence",
    },
  }

  return map[id as Exclude<FlowNodeId, `model:${string}`>]
}

export function renderFlowNodeContent(id: FlowNodeId): ReactNode {
  if (id.startsWith("model:")) {
    return <ModelDetail catalogId={id.slice("model:".length)} />
  }

  switch (id) {
    case "input":
      return (
        <div className="space-y-3">
          <p>
            Analysis begins when the frontend posts text to <code className="text-primary">POST /analyze</code>.
            The backend validates the payload before any model work starts.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Text is required and must be 500 characters or fewer</li>
            <li>Platform defaults to Reddit when omitted</li>
            <li>
              Optional <code className="text-primary">custom_policy_text</code> is used only when
              platform is Custom
            </li>
          </ul>
        </div>
      )

    case "context":
      return (
        <div className="space-y-3">
          <p>
            The models themselves are frozen — thresholds are fixed, not adjusted per platform. All
            platforms use identical base thresholds. Platform context instead determines how Claude
            Haiku interprets each model&apos;s output against that platform&apos;s specific content
            policy.
          </p>
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 font-mono text-xs text-primary">
            Fixed thresholds: Allow &lt; 0.40 · Review 0.40–0.70 · Remove ≥ 0.70
          </div>
          <div className="overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full text-left text-sm">
              <tbody>
                {PLATFORM_ROWS.map(([platform, policy]) => (
                  <tr key={platform} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2 font-medium">{platform}</td>
                    <td className="px-4 py-2 text-muted-foreground">{policy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

    case "parallel":
      return (
        <div className="space-y-3">
          <p>
            All eight moderation providers run concurrently via{" "}
            <code className="text-primary">ThreadPoolExecutor</code> in{" "}
            <code className="text-primary">run_models()</code>. This is the pipeline&apos;s only true
            fan-out: lanes execute at the same time, then reconverge into one result list.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>3 enterprise APIs + OpenAI Moderation + 4 HuggingFace open-source detectors</li>
            <li>Per-model failures or missing credentials do not abort the whole request</li>
            <li>Click an individual lane in the diagram for that model&apos;s card details</li>
          </ul>
        </div>
      )

    case "normalize":
      return (
        <div className="space-y-3">
          <p>
            Each model returns data in a different format. toxic-bert returns multi-label
            probabilities. roberta-offensive returns a binary score. The hate speech model returns
            hate/not-hate. Raw outputs are incompatible for direct comparison.
          </p>
          <p>The Normalizer converts every model&apos;s output into a unified schema:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Standardized category mapping across all providers</li>
            <li>Floating point score alignment (0.00 - 1.00)</li>
            <li>Action assignment based on fixed thresholds</li>
          </ul>
          <SchemaBlock />
        </div>
      )

    case "align":
      return (
        <div className="space-y-3">
          <p>
            After normalization, ModEval asks Claude Haiku to assess whether each model&apos;s output
            aligns with the selected platform policy. When the AI alignment call is unavailable, the
            system falls back to keyword-based policy evaluation.
          </p>
          <p>
            Each active model receives an <code className="text-primary">aligned</code> boolean and an{" "}
            <code className="text-primary">alignment_reason</code> explaining the judgment.
          </p>
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-300/90">
              Keyword fallback path
            </p>
            <p className="mt-2">
              If Claude is unavailable, <code className="text-primary">evaluate_policy_alignment()</code>{" "}
              scores each result against zero-tolerance and deprioritized categories. This is a
              failover path — not a parallel fork — shown as the dashed amber connector on the
              diagram.
            </p>
          </div>
        </div>
      )

    case "disagree":
      return (
        <div className="space-y-3">
          <p>
            Disagreements are treated as useful signals, not noise. ModEval surfaces two mismatch
            types:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Action mismatch</strong> — models disagree on Allow / Review / Remove
            </li>
            <li>
              <strong>Category mismatch</strong> — models flag different primary risk categories
            </li>
          </ul>
          <blockquote className="border-l-2 border-primary/50 pl-4 text-sm italic text-muted-foreground">
            When models disagree, the disagreement itself is often the most valuable output for a
            Trust &amp; Safety reviewer.
          </blockquote>
        </div>
      )

    case "insights":
      return (
        <div className="space-y-3">
          <p>
            After disagreements are detected, <code className="text-primary">build_insights()</code>{" "}
            summarizes the active model set into three posture signals used by the Analysis UI:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Strictest model</strong> — highest action rank (Remove &gt; Review &gt; Allow),
              with confidence as a tie-breaker
            </li>
            <li>
              <strong>Most lenient model</strong> — lowest action rank, with confidence as a
              tie-breaker
            </li>
            <li>
              <strong>Consensus recommendation</strong> — majority action across active models, or{" "}
              <code className="text-primary">No Consensus</code> when the top two actions are tied
            </li>
          </ul>
          <p>
            Error rows are excluded from this calculation. The finding tag in the UI (CLEAR
            VIOLATION / CLEAR SAFE / AMBIGUOUS) is derived from this consensus field.
          </p>
        </div>
      )

    case "ai-interpretation":
      return (
        <div className="space-y-3">
          <p>
            After all eight models return and disagreements are detected, ModEval passes the full
            output to Claude Haiku for synthesis. The interpretation produces disagreement
            explanation, risk narrative, context sensitivity, and contested category fields.
          </p>
          <p>
            If the Claude call fails or times out, AI analysis may return empty and the UI falls back
            to structured consensus data.
          </p>
        </div>
      )

    case "response":
      return (
        <div className="space-y-3">
          <p>
            The backend returns a single JSON payload containing{" "}
            <code className="text-primary">results</code>,{" "}
            <code className="text-primary">disagreements</code>,{" "}
            <code className="text-primary">insights</code>, and{" "}
            <code className="text-primary">ai_analysis</code>.
          </p>
          <p>
            The React frontend maps that payload into Summary, Model Breakdown, and AI Interpretation
            tabs — decision matrix, consensus hero, disagreement banner, alignment reasons, and
            narrative fields.
          </p>
        </div>
      )

    case "why-models":
      return (
        <div className="space-y-3">
          <p>
            The eight models were selected for architectural diversity and distinct training
            datasets — covering enterprise proprietary APIs and specialized open-source detectors
            for toxicity, offense, hate, and bias.
          </p>
        </div>
      )

    case "limitations":
      return (
        <ul className="list-disc space-y-1 pl-5">
          <li>Models are frozen — thresholds do not adapt dynamically per platform</li>
          <li>Platform policies are approximations, not live enforcement guarantees</li>
          <li>English-language text only</li>
          <li>Text moderation only — no image/video/audio</li>
          <li>Provider rate limits can disable or error individual models</li>
        </ul>
      )

    default:
      return null
  }
}
