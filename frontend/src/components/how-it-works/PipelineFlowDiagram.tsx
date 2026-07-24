import { MODEL_LANES, type FlowNodeId } from "@/components/how-it-works/flowContent"
import { cn } from "@/lib/utils"

type PipelineFlowDiagramProps = {
  activeId: FlowNodeId | null
  onSelect: (id: FlowNodeId) => void
}

/** Narrow vertical column — sits clear of the right-side detail drawer. */
const CX = 340
const NODE_W = 180
const NODE_H = 52
const NODE_X = CX - NODE_W / 2

const LANE_W = 70
const LANE_H = 44
const LANE_GAP = 6
const LANE_ROW_W = MODEL_LANES.length * LANE_W + (MODEL_LANES.length - 1) * LANE_GAP
const LANE_ROW_X = CX - LANE_ROW_W / 2
const LANE_Y = 248

const Y = {
  input: 24,
  context: 112,
  why: 168,
  split: 208,
  lanes: LANE_Y,
  converge: 312,
  parallelLabel: 328,
  normalize: 368,
  align: 456,
  disagree: 544,
  insights: 632,
  ai: 720,
  response: 808,
  limitations: 900,
} as const

function laneX(index: number) {
  return LANE_ROW_X + index * (LANE_W + LANE_GAP)
}

function NodeButton({
  id,
  activeId,
  onSelect,
  x,
  y,
  width,
  height,
  title,
  subtitle,
  variant = "default",
}: {
  id: FlowNodeId
  activeId: FlowNodeId | null
  onSelect: (id: FlowNodeId) => void
  x: number
  y: number
  width: number
  height: number
  title: string
  subtitle: string
  variant?: "default" | "primary" | "meta" | "lane"
}) {
  const selected = activeId === id
  const isLane = variant === "lane"

  return (
    <g
      role="button"
      tabIndex={0}
      data-flow-node={id}
      aria-label={title}
      aria-pressed={selected}
      className="cursor-pointer outline-none focus-visible:[&_rect]:stroke-primary"
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect(id)
        }
      }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={isLane ? 7 : 10}
        className={cn(
          "fill-[rgba(22,34,56,0.95)] stroke-[1.5] transition-[stroke,fill]",
          variant === "primary" && "fill-[rgba(24,42,62,0.95)] stroke-primary/55",
          variant === "default" && "stroke-border",
          variant === "meta" && "fill-[rgba(40,32,20,0.7)] stroke-amber-400/40",
          variant === "lane" && "fill-[rgba(16,26,44,0.75)] stroke-primary/30",
          selected && "stroke-primary fill-primary/15",
          !selected && "hover:stroke-primary/70"
        )}
        strokeDasharray={isLane && !selected ? "4 3" : undefined}
      />
      <text
        x={x + width / 2}
        y={isLane ? y + height / 2 + 3 : y + 22}
        textAnchor="middle"
        className="fill-foreground pointer-events-none select-none"
        style={{ fontSize: isLane ? 8 : 13, fontWeight: isLane ? 500 : 600 }}
      >
        {title}
      </text>
      {!isLane && subtitle ? (
        <text
          x={x + width / 2}
          y={y + 38}
          textAnchor="middle"
          className="fill-muted-foreground pointer-events-none select-none font-mono"
          style={{ fontSize: 9 }}
        >
          {subtitle}
        </text>
      ) : null}
    </g>
  )
}

export function PipelineFlowDiagram({ activeId, onSelect }: PipelineFlowDiagramProps) {
  return (
    <div className="pipeline-flow-shell mx-auto max-w-[680px] rounded-2xl border border-border/70 bg-card/30 p-3 sm:p-4">
      <svg
        viewBox="0 0 680 980"
        className="pipeline-flow h-auto w-full"
        role="img"
        aria-labelledby="pipeline-flow-title pipeline-flow-desc"
      >
        <title id="pipeline-flow-title">ModEval analysis pipeline flow</title>
        <desc id="pipeline-flow-desc">
          Vertical interactive diagram of the ModEval moderation pipeline. Flow runs top to bottom,
          with an eight-model horizontal fan-out cluster for parallel inference.
        </desc>

        <rect
          x={LANE_ROW_X - 12}
          y={Y.split - 6}
          width={LANE_ROW_W + 24}
          height={Y.converge - Y.split + 34}
          rx={14}
          className="fill-primary/[0.04] stroke-primary/15"
        />
        <text
          x={CX}
          y={Y.split + 8}
          textAnchor="middle"
          className="fill-primary font-mono uppercase tracking-wider"
          style={{ fontSize: 9 }}
        >
          Fan-out / Fan-in · simultaneous
        </text>

        {/* Vertical trunk */}
        <path className="flow-connector flow-pulse" d={`M${CX} ${Y.input + NODE_H} V${Y.context}`} />
        <path className="flow-connector flow-pulse" d={`M${CX} ${Y.context + NODE_H} V${Y.split}`} />

        {/* Horizontal fan-out / fan-in — same animation class, no stagger */}
        {MODEL_LANES.map((_, index) => {
          const lx = laneX(index) + LANE_W / 2
          return (
            <g key={`fan-${index}`}>
              <path className="flow-connector flow-pulse" d={`M${CX} ${Y.split} H${lx} V${Y.lanes}`} />
              <path
                className="flow-connector flow-pulse"
                d={`M${lx} ${Y.lanes + LANE_H} V${Y.converge} H${CX}`}
              />
            </g>
          )
        })}

        <path className="flow-connector flow-pulse" d={`M${CX} ${Y.converge} V${Y.normalize}`} />
        <path
          className="flow-connector flow-pulse"
          d={`M${CX} ${Y.normalize + NODE_H} V${Y.align}`}
        />
        <path
          className="flow-connector flow-pulse"
          d={`M${CX} ${Y.align + NODE_H} V${Y.disagree}`}
        />
        <path
          className="flow-connector flow-pulse"
          d={`M${CX} ${Y.disagree + NODE_H} V${Y.insights}`}
        />
        <path className="flow-connector flow-pulse" d={`M${CX} ${Y.insights + NODE_H} V${Y.ai}`} />
        <path className="flow-connector flow-pulse" d={`M${CX} ${Y.ai + NODE_H} V${Y.response}`} />

        {/* Keyword fallback beside Align */}
        <path
          className="flow-fallback"
          d={`M${NODE_X + NODE_W + 6} ${Y.align + 26} H${NODE_X + NODE_W + 42} V${Y.disagree - 6} H${CX + 10}`}
          fill="none"
        />
        <text
          x={NODE_X + NODE_W + 48}
          y={Y.align + 40}
          className="fill-muted-foreground font-mono"
          style={{ fontSize: 8 }}
        >
          keyword fallback
        </text>

        {/* Why These Models → cluster annotation */}
        <path
          className="flow-fallback"
          d={`M${16 + 148} ${Y.why + NODE_H / 2} H${LANE_ROW_X - 4} V${Y.split + 20}`}
          fill="none"
        />

        <NodeButton
          id="input"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X}
          y={Y.input}
          width={NODE_W}
          height={NODE_H}
          title="1. Input"
          subtitle="validate payload"
          variant="primary"
        />
        <NodeButton
          id="context"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X}
          y={Y.context}
          width={NODE_W}
          height={NODE_H}
          title="2. Context"
          subtitle="thresholds · policy"
        />

        <NodeButton
          id="why-models"
          activeId={activeId}
          onSelect={onSelect}
          x={16}
          y={Y.why}
          width={148}
          height={NODE_H}
          title="Why These Models"
          subtitle="annotates node 3"
          variant="meta"
        />

        {MODEL_LANES.map((lane, index) => (
          <NodeButton
            key={lane.key}
            id={`model:${lane.catalogId}`}
            activeId={activeId}
            onSelect={onSelect}
            x={laneX(index)}
            y={Y.lanes}
            width={LANE_W}
            height={LANE_H}
            title={lane.label}
            subtitle=""
            variant="lane"
          />
        ))}

        <g
          role="button"
          tabIndex={0}
          data-flow-node="parallel"
          aria-label="Parallel Inference cluster"
          className="cursor-pointer outline-none"
          onClick={() => onSelect("parallel")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onSelect("parallel")
            }
          }}
        >
          <rect
            x={CX - 92}
            y={Y.parallelLabel}
            width={184}
            height={26}
            rx={8}
            className={cn(
              "fill-card/60 stroke-border stroke-[1.2]",
              activeId === "parallel" && "stroke-primary fill-primary/15"
            )}
          />
          <text
            x={CX}
            y={Y.parallelLabel + 17}
            textAnchor="middle"
            className="fill-muted-foreground pointer-events-none font-mono"
            style={{ fontSize: 10 }}
          >
            3. Parallel Inference
          </text>
        </g>

        <NodeButton
          id="normalize"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X}
          y={Y.normalize}
          width={NODE_W}
          height={NODE_H}
          title="4. Normalize"
          subtitle="schema · action"
          variant="primary"
        />
        <NodeButton
          id="align"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X}
          y={Y.align}
          width={NODE_W}
          height={NODE_H}
          title="5. Align"
          subtitle="Claude Haiku"
        />
        <NodeButton
          id="disagree"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X}
          y={Y.disagree}
          width={NODE_W}
          height={NODE_H}
          title="6. Disagree"
          subtitle="action · category"
        />
        <NodeButton
          id="insights"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X}
          y={Y.insights}
          width={NODE_W}
          height={NODE_H}
          title="7. Insights"
          subtitle="strict · lenient · consensus"
        />
        <NodeButton
          id="ai-interpretation"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X}
          y={Y.ai}
          width={NODE_W}
          height={NODE_H}
          title="8. AI Interpretation"
          subtitle="4 narrative fields"
          variant="primary"
        />
        <NodeButton
          id="response"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X}
          y={Y.response}
          width={NODE_W}
          height={NODE_H}
          title="9. Response"
          subtitle="JSON → UI"
        />
        <NodeButton
          id="limitations"
          activeId={activeId}
          onSelect={onSelect}
          x={NODE_X - 10}
          y={Y.limitations}
          width={NODE_W + 20}
          height={NODE_H}
          title="Known Limitations"
          subtitle="companion · not a stage"
          variant="meta"
        />
      </svg>
    </div>
  )
}
