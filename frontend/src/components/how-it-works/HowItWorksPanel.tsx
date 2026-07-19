import type { ReactNode } from "react"

const ARCH_STEPS = [
  "User Input",
  "Parallel API Calls",
  "8 Models",
  "Normalize + Platform",
  "Results",
]

export function HowItWorksPanel() {
  return (
    <div className="mx-auto max-w-[1100px] space-y-8 px-4 py-8 sm:px-8">
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          Methodology & Framework
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">How It Works</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          8 independent models analyze every submission simultaneously. Outputs are normalized,
          scored against platform-specific AI policy alignment, and resolved into a single verdict.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-medium">System Architecture</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The technical flow of information from request to high-fidelity safety score.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {ARCH_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`rounded-lg border px-3 py-2 font-mono text-[11px] ${
                  index === ARCH_STEPS.length - 1
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border/70 bg-card/50 text-muted-foreground"
                }`}
              >
                {step}
              </div>
              {index < ARCH_STEPS.length - 1 ? (
                <span className="text-muted-foreground">→</span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <Section label="Section 1" title="Unified Output Normalization">
        <p>
          Each model returns data in a different format. toxic-bert returns multi-label
          probabilities. roberta-offensive returns a binary score. The hate speech model returns
          hate/not-hate. Raw outputs are incompatible for direct comparison.
        </p>
        <p className="mt-3">The Normalizer converts every model&apos;s output into a unified schema:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Standardized category mapping across all providers</li>
          <li>Floating point score alignment (0.00 - 1.00)</li>
          <li>Action assignment based on fixed thresholds</li>
        </ul>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border/70 bg-background/70 p-4 font-mono text-xs text-platinum">
{`{
  model: string,
  top_category: string,
  confidence: number (0-1),
  action: "Allow" | "Review" | "Remove",
  flagged: boolean
}`}
        </pre>
      </Section>

      <Section label="Section 2" title="Context Engine">
        <p>
          The models themselves are frozen — thresholds are fixed, not adjusted per platform. All
          platforms use identical base thresholds. Platform context instead determines how Claude
          Haiku interprets each model&apos;s output against that platform&apos;s specific content
          policy.
        </p>
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 font-mono text-xs text-primary">
          Fixed thresholds: Allow &lt; 0.40 · Review 0.40–0.70 · Remove ≥ 0.70
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border/70">
          <table className="w-full text-left text-sm">
            <tbody>
              {[
                ["Reddit", "Reddit content policy rules"],
                ["Discord", "Discord community guidelines"],
                ["Facebook", "Meta Community Standards"],
                ["Instagram", "Meta Community Standards (unified)"],
                ["Custom", "User-defined policy notes"],
              ].map(([platform, policy]) => (
                <tr key={platform} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2 font-medium">{platform}</td>
                  <td className="px-4 py-2 text-muted-foreground">{policy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section label="Section 3" title="Policy Alignment Engine">
        <p>
          After normalization, ModEval asks Claude Haiku to assess whether each model&apos;s output
          aligns with the selected platform policy. When the AI alignment call is unavailable, the
          system falls back to keyword-based policy evaluation.
        </p>
        <p className="mt-3">
          Each active model receives an <code className="text-primary">aligned</code> boolean and an{" "}
          <code className="text-primary">alignment_reason</code> explaining the judgment.
        </p>
      </Section>

      <Section label="Section 4" title="Disagreement Detection">
        <p>
          Disagreements are treated as useful signals, not noise. ModEval surfaces two mismatch
          types:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong>Action mismatch</strong> — models disagree on Allow / Review / Remove
          </li>
          <li>
            <strong>Category mismatch</strong> — models flag different primary risk categories
          </li>
        </ul>
        <blockquote className="mt-4 border-l-2 border-primary/50 pl-4 text-sm italic text-muted-foreground">
          When models disagree, the disagreement itself is often the most valuable output for a
          Trust & Safety reviewer.
        </blockquote>
      </Section>

      <Section label="Section 5" title="AI Interpretation Layer">
        <p>
          After all eight models return and disagreements are detected, ModEval passes the full
          output to Claude Haiku for synthesis. The interpretation produces disagreement
          explanation, risk narrative, context sensitivity, and contested category fields.
        </p>
        <p className="mt-3">
          If the Claude call fails or times out, AI analysis may return empty and the UI falls back
          to structured consensus data.
        </p>
      </Section>

      <Section label="Section 6" title="Why These Models">
        <p>
          The eight models were selected for architectural diversity and distinct training
          datasets — covering enterprise proprietary APIs and specialized open-source detectors
          for toxicity, offense, hate, and bias.
        </p>
      </Section>

      <Section label="Section 7" title="Known Limitations">
        <ul className="list-disc space-y-1 pl-5">
          <li>Models are frozen — thresholds do not adapt dynamically per platform</li>
          <li>Platform policies are approximations, not live enforcement guarantees</li>
          <li>English-language text only</li>
          <li>Text moderation only — no image/video/audio</li>
          <li>Provider rate limits can disable or error individual models</li>
        </ul>
      </Section>
    </div>
  )
}

function Section({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{label}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
      <div className="mt-4 space-y-1 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
