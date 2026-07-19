import { cn } from "@/lib/utils"
import type { NavPanel } from "@/types/api"

const NAV_ITEMS: Array<{ id: NavPanel; label: string }> = [
  { id: "analysis", label: "Analysis" },
  { id: "how-it-works", label: "How It Works" },
  { id: "models", label: "Models" },
]

type TopBarProps = {
  activePanel: NavPanel
  onNavigate: (panel: NavPanel) => void
  modelCountLabel: string
  healthOk: boolean | null
}

export function TopBar({ activePanel, onNavigate, modelCountLabel, healthOk }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => onNavigate("analysis")}
            className="font-semibold tracking-tight text-foreground"
          >
            Mod<span className="text-primary">Eval</span>
          </button>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-200",
                  activePanel === item.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="live-dot"
                style={{ animationDelay: `${index * 120}ms` }}
              />
            ))}
          </div>
          <div className="rounded-full border border-border/80 bg-card/80 px-3 py-1 font-mono text-[11px] text-platinum">
            <span className="mr-2 inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  healthOk === false ? "bg-remove" : "bg-primary",
                )}
              />
              {healthOk === false ? "API offline" : "Live"}
            </span>
            · {modelCountLabel}
          </div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border/50 px-4 py-2 sm:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cn(
              "rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] whitespace-nowrap",
              activePanel === item.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
