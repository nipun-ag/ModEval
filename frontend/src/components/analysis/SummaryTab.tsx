import { motion } from "motion/react"
import type { AnalyzeResponse } from "@/types/api"
import {
  actionTone,
  generateConsensusSummary,
  getDisagreementItems,
} from "@/lib/analysis"
import { DonutChart } from "@/components/analysis/DonutChart"
import { cn } from "@/lib/utils"

type SummaryTabProps = {
  data: AnalyzeResponse
}

export function SummaryTab({ data }: SummaryTabProps) {
  const disagreements = getDisagreementItems(data.disagreements)
  const priority = [...disagreements].sort((a, b) => {
    const order = ["Action Mismatch", "Category Mismatch"]
    return order.indexOf(a.type) - order.indexOf(b.type)
  })[0]

  const consensus = data.insights?.consensus_recommendation || "No Consensus"
  const tone = actionTone(consensus === "No Consensus" ? "Review" : consensus)
  const subtitle = generateConsensusSummary(
    data.results,
    data.insights,
    data.disagreements,
  )

  const messages: Record<string, string> = {
    "Action Mismatch": "Action conflict detected - models disagree on final recommendation",
    "Category Mismatch": "Category mismatch detected - models flagged different primary risks",
  }

  return (
    <div className="space-y-5">
      {priority ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start gap-3 rounded-lg border border-review/30 bg-review/10 px-4 py-3 text-sm text-review"
        >
          <span className="mt-0.5 font-mono text-xs">!</span>
          <span>{messages[priority.type] || priority.description}</span>
        </motion.div>
      ) : null}

      <motion.div
        layout
        className={cn(
          "rounded-xl border bg-card/70 p-5",
          tone === "allow" && "border-l-4 border-l-allow",
          tone === "remove" && "border-l-4 border-l-remove",
          tone === "review" && "border-l-4 border-l-review",
        )}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Aggregated Consensus
        </p>
        <h3
          className={cn(
            "mt-2 text-3xl font-semibold tracking-tight uppercase",
            tone === "allow" && "text-allow",
            tone === "remove" && "text-remove",
            tone === "review" && "text-review",
          )}
        >
          {consensus}
        </h3>
        {subtitle ? (
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </motion.div>

      <div className="rounded-xl border border-border/80 bg-card/50 p-5">
        <DonutChart results={data.results} />
      </div>
    </div>
  )
}
