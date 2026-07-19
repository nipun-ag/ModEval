import { motion, AnimatePresence } from "motion/react"
import type { AnalyzeResponse, PanelState, Platform, ResultsTab } from "@/types/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SummaryTab } from "@/components/analysis/SummaryTab"
import { BreakdownTab } from "@/components/analysis/BreakdownTab"
import { InsightsTab } from "@/components/analysis/InsightsTab"
import { cn } from "@/lib/utils"

type ResultsPanelProps = {
  state: PanelState
  data: AnalyzeResponse | null
  errorMessage: string | null
  platform: Platform
  activeTab: ResultsTab
  onTabChange: (tab: ResultsTab) => void
}

export function ResultsPanel({
  state,
  data,
  errorMessage,
  platform,
  activeTab,
  onTabChange,
}: ResultsPanelProps) {
  const statusLabel =
    state === "loading"
      ? "Waiting for input"
      : state === "results"
        ? "Analysis complete"
        : state === "error"
          ? "Request failed"
          : "Waiting for input"

  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-[oklch(0.45_0.1_280_/0.12)] blur-3xl" />

      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Analysis Output
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Model Comparison</h2>
          <div className="text-right">
            <p
              className={cn(
                "font-mono text-xs",
                state === "results" && "text-allow",
                state === "error" && "text-remove",
                state === "loading" && "text-primary",
                state === "empty" && "text-muted-foreground",
              )}
            >
              {statusLabel}
            </p>
            {state === "results" ? (
              <p className="mt-1 max-w-[240px] text-[11px] text-muted-foreground">
                Surfacing model limitations is core to what ModEval does.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {state === "empty" ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[360px] flex-col items-center justify-center text-center"
              >
                <h3 className="text-lg font-medium">Run your first analysis</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  ModEval will compare model decisions, policy alignment, and disagreement signals
                  here
                </p>
              </motion.div>
            ) : null}

            {state === "loading" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[360px] flex-col items-center justify-center gap-4"
              >
                <div className="h-0.5 w-48 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/2 animate-pulse bg-primary" />
                </div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-4 size-28 rounded-full" />
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </motion.div>
            ) : null}

            {state === "error" ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-remove/30 bg-remove/10 p-5"
              >
                <h3 className="text-sm font-medium text-remove">Request failed</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {errorMessage || "Something went wrong while contacting the API."}
                </p>
              </motion.div>
            ) : null}

            {state === "results" && data ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => onTabChange(value as ResultsTab)}
                >
                  <TabsList className="mb-5 w-full justify-start overflow-x-auto bg-background/50">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="breakdown">Model Breakdown</TabsTrigger>
                    <TabsTrigger value="insights">AI Interpretation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary">
                    <SummaryTab data={data} />
                  </TabsContent>
                  <TabsContent value="breakdown">
                    <BreakdownTab results={data.results} />
                  </TabsContent>
                  <TabsContent value="insights">
                    <InsightsTab data={data} platform={platform} />
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
