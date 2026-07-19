import type { ModelResult } from "@/types/api"
import { ENTERPRISE_MODELS, OPENSOURCE_MODELS } from "@/data/models"
import { actionTone, modelDisplay } from "@/lib/analysis"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BreakdownTabProps = {
  results: ModelResult[]
}

function BreakdownCard({ result }: { result: ModelResult }) {
  const display = modelDisplay(result.model)

  if (result.disabled) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card/40 px-4 py-3 opacity-40">
        <div>
          <div className="text-sm font-medium">{display.name}</div>
          <div className="text-xs text-muted-foreground">{display.subtitle}</div>
          <Badge variant="outline" className="mt-2 font-mono text-[10px]">
            {display.chip}
          </Badge>
        </div>
        <span className="font-mono text-[11px] italic text-muted-foreground">Coming Soon</span>
      </div>
    )
  }

  if (result.error) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">{display.name}</div>
          <div className="text-xs text-muted-foreground">
            {display.subtitle} · Model unavailable
          </div>
          <Badge variant="outline" className="mt-2 font-mono text-[10px]">
            {display.chip}
          </Badge>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs">
          <span className="text-muted-foreground">unavailable</span>
          <span className="text-muted-foreground">–</span>
          <span className="action-error rounded-md border px-2.5 py-1">Error</span>
        </div>
      </div>
    )
  }

  const tone = actionTone(result.action)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        tone === "allow" && "border-l-4 border-l-allow",
        tone === "remove" && "border-l-4 border-l-remove",
        tone === "review" && "border-l-4 border-l-review",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{display.name}</div>
        <div className="text-xs text-muted-foreground">
          {display.subtitle} · Live inference
        </div>
        <Badge variant="outline" className="mt-2 font-mono text-[10px]">
          {display.chip}
        </Badge>
      </div>
      <div className="grid grid-cols-3 items-center gap-4 font-mono text-xs sm:w-[280px]">
        <span className="truncate text-foreground">{result.top_category}</span>
        <span className="text-platinum">{Number(result.confidence ?? 0).toFixed(2)}</span>
        <span
          className={cn(
            "justify-self-end rounded-md border px-2.5 py-1 uppercase tracking-[0.08em]",
            tone === "allow" && "action-allow",
            tone === "remove" && "action-remove",
            tone === "review" && "action-review",
          )}
        >
          {result.action}
        </span>
      </div>
    </div>
  )
}

function Section({
  title,
  modelNames,
  results,
}: {
  title: string
  modelNames: readonly string[]
  results: ModelResult[]
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="hidden grid-cols-[1fr_280px] gap-4 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:grid">
        <span />
        <div className="grid grid-cols-3 gap-4">
          <span>Category</span>
          <span>Confidence</span>
          <span className="text-right">Action</span>
        </div>
      </div>
      <div className="space-y-2">
        {modelNames.map((modelName) => {
          const result = results.find((item) => item.model === modelName)
          return result ? <BreakdownCard key={modelName} result={result} /> : null
        })}
      </div>
    </section>
  )
}

export function BreakdownTab({ results }: BreakdownTabProps) {
  if (!results.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No model output available.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Section title="Enterprise APIs" modelNames={ENTERPRISE_MODELS} results={results} />
      <Section title="Open Source Models" modelNames={OPENSOURCE_MODELS} results={results} />
    </div>
  )
}
