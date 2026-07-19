import type { AnalyzeResponse, Platform } from "@/types/api"
import { findingTag, modelDisplay } from "@/lib/analysis"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type InsightsTabProps = {
  data: AnalyzeResponse
  platform: Platform
}

function highlightActions(text: string) {
  return text.split(/\b(ALLOW|REVIEW|REMOVE)\b/g).map((part, index) => {
    if (part === "ALLOW") {
      return (
        <span key={index} className="font-semibold text-allow">
          {part}
        </span>
      )
    }
    if (part === "REVIEW") {
      return (
        <span key={index} className="font-semibold text-review">
          {part}
        </span>
      )
    }
    if (part === "REMOVE") {
      return (
        <span key={index} className="font-semibold text-remove">
          {part}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function InsightsTab({ data, platform }: InsightsTabProps) {
  const active = data.results.filter((result) => !result.disabled && !result.error)
  const strictest = data.insights?.strictest_model
  const lenient = data.insights?.most_lenient_model
  const tag = findingTag(data.insights?.consensus_recommendation)
  const risk = data.ai_analysis?.risk_narrative || "Analysis complete."

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-card/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <span className="mt-0.5 text-primary">i</span>
        <span>
          Interpreted by Claude Haiku. AI interpretation is probabilistic and may contain errors —
          intended to assist human review, not replace it.
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-border/70 bg-card/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-review">
            Disagreement Vector
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {highlightActions(
              data.ai_analysis?.disagreement_explanation || "No disagreement data available.",
            )}
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border border-border/70 bg-card/50 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-allow">
              Most Lenient
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              The model most likely to allow this content through.
            </p>
            <p className="mt-3 text-sm font-medium">
              {modelDisplay(lenient?.model || "").name || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {modelDisplay(lenient?.model || "").subtitle}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/50 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-remove">
              Strictest Model
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              The model that flagged this content most aggressively across all signals.
            </p>
            <p className="mt-3 text-sm font-medium">
              {modelDisplay(strictest?.model || "").name || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {modelDisplay(strictest?.model || "").subtitle}
            </p>
          </div>
        </div>
      </div>

      {(data.ai_analysis?.context_sensitivity || data.ai_analysis?.contested_category) && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.ai_analysis?.context_sensitivity ? (
            <div className="rounded-xl border border-border/70 bg-card/40 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                Context Sensitivity
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {data.ai_analysis.context_sensitivity}
              </p>
            </div>
          ) : null}
          {data.ai_analysis?.contested_category ? (
            <div className="rounded-xl border border-border/70 bg-card/40 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                Contested Category
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {data.ai_analysis.contested_category}
              </p>
            </div>
          ) : null}
        </div>
      )}

      <div className="rounded-xl border border-border/70 bg-card/40 p-4">
        <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
          Policy Alignment
        </h4>
        <div className="mt-4 space-y-3">
          {active.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">No alignment data available.</p>
          ) : (
            active.map((result) => (
              <div
                key={result.model}
                className="grid gap-2 border-b border-border/40 pb-3 last:border-0 last:pb-0 sm:grid-cols-[180px_1fr]"
              >
                <div className="text-sm font-medium">{result.model}</div>
                <div>
                  <Badge
                    className={cn(
                      "font-mono text-[10px]",
                      result.aligned
                        ? "bg-allow/15 text-allow hover:bg-allow/15"
                        : "bg-remove/15 text-remove hover:bg-remove/15",
                    )}
                  >
                    {result.aligned ? "ALIGNED" : "MISALIGNED"}
                  </Badge>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {result.alignment_reason || result.explanation || ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="mt-4 font-mono text-[10px] text-muted-foreground">
          Alignment assessed by Claude Haiku against {platform} content policy.
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-card/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
            Executive Summary
          </span>
          <Badge variant="outline" className="font-mono text-[10px]">
            Consensus: {data.insights?.consensus_recommendation || "—"}
          </Badge>
        </div>
        <Badge
          className={cn(
            "mt-3 font-mono text-[10px]",
            tag.className === "violation" && "bg-remove/15 text-remove hover:bg-remove/15",
            tag.className === "safe" && "bg-allow/15 text-allow hover:bg-allow/15",
            tag.className === "grey" && "bg-review/15 text-review hover:bg-review/15",
          )}
        >
          {tag.text}
        </Badge>
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">{risk}</p>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Model Confidence
        </p>
        <div className="mt-3 space-y-3">
          {active.map((result) => {
            const confidence = Number(result.confidence ?? 0)
            return (
              <div key={result.model} className="grid grid-cols-[1fr_120px_48px] items-center gap-3">
                <span className="truncate text-xs text-muted-foreground">{result.model}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.round(confidence * 100)}%` }}
                  />
                </div>
                <span className="text-right font-mono text-xs">{confidence.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
