import { useState } from "react"

import { FlowDetailDrawer } from "@/components/how-it-works/FlowDetailDrawer"
import { PipelineFlowDiagram } from "@/components/how-it-works/PipelineFlowDiagram"
import type { FlowNodeId } from "@/components/how-it-works/flowContent"

export function HowItWorksPanel() {
  const [activeNode, setActiveNode] = useState<FlowNodeId | null>(null)

  return (
    <div className="mx-auto max-w-[1320px] space-y-6 px-4 py-8 sm:px-8">
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          Methodology & Framework
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">How It Works</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          8 independent models analyze every submission simultaneously. Outputs are normalized,
          scored against platform-specific AI policy alignment, and resolved into a single verdict.
          Click any node for that stage&apos;s full detail.
        </p>
      </section>

      {/* Vertical column stays clear of the fixed right drawer above ~1280px;
          below that breakpoint the drawer overlays with a scrim.
          Panel max-width must stay ≥ breakpoint so the column does not center
          into the drawer before side-by-side mode engages. */}
      <div className="max-w-[780px]">
        <PipelineFlowDiagram activeId={activeNode} onSelect={setActiveNode} />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Vertical trunk · horizontal fan-out at parallel inference · ambient pulse respects
          prefers-reduced-motion
        </p>
      </div>

      <FlowDetailDrawer
        nodeId={activeNode}
        onClose={() => setActiveNode(null)}
        onSelectNode={setActiveNode}
      />
    </div>
  )
}
