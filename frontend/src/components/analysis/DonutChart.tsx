import { useMemo } from "react"
import type { ModelResult } from "@/types/api"
import { donutSegments } from "@/lib/analysis"
import { cn } from "@/lib/utils"

type DonutChartProps = {
  results: ModelResult[]
}

export function DonutChart({ results }: DonutChartProps) {
  const { ordered, total, dominant } = useMemo(() => donutSegments(results), [results])
  const radius = 54
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative size-36">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="oklch(0.22 0.03 250)"
            strokeWidth="14"
          />
          {ordered.map((segment) => {
            if (!segment.count || !total) return null
            const length = (segment.count / total) * circumference
            const circle = (
              <circle
                key={segment.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="14"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                className="transition-[stroke-dasharray,stroke-dashoffset] duration-300 ease-out"
              />
            )
            offset += length
            return circle
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-semibold text-foreground">
            {dominant.count}/{total || 0}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {dominant.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {ordered.map((segment) => (
          <div key={segment.label} className="flex items-center gap-3 font-mono text-xs">
            <span
              className={cn("size-2.5 rounded-full")}
              style={{ background: segment.color }}
            />
            <span className="w-16 uppercase tracking-[0.12em] text-muted-foreground">
              {segment.label}
            </span>
            <span className="text-foreground">{segment.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
