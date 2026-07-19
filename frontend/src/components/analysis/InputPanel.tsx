import { useMemo, useRef, useState } from "react"
import { ChevronDown, Info } from "lucide-react"
import { EXAMPLE_CATEGORIES, EXAMPLE_LIBRARY } from "@/data/examples"
import { PLATFORM_POLICIES, PLATFORM_TOOLTIP, PLATFORMS } from "@/data/platforms"
import { MAX_INPUT_LENGTH } from "@/data/models"
import type { Platform } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type InputPanelProps = {
  text: string
  onTextChange: (value: string) => void
  platform: Platform
  onPlatformChange: (platform: Platform) => void
  customPolicy: string
  onCustomPolicyChange: (value: string) => void
  loading: boolean
  onAnalyze: () => void
}

export function InputPanel({
  text,
  onTextChange,
  platform,
  onPlatformChange,
  customPolicy,
  onCustomPolicyChange,
  loading,
  onAnalyze,
}: InputPanelProps) {
  const [platformOpen, setPlatformOpen] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)
  const [policySaved, setPolicySaved] = useState(false)
  const [activeExample, setActiveExample] = useState<string | null>(null)
  const lastExampleRef = useRef<Record<string, string>>({})

  const counterTone =
    text.length >= 450 ? "text-remove" : text.length >= 300 ? "text-review" : "text-allow"

  const selectedPlatform = useMemo(
    () => PLATFORMS.find((item) => item.id === platform) ?? PLATFORMS[0],
    [platform],
  )

  function loadExample(category: string) {
    const examples = EXAMPLE_LIBRARY[category] || []
    if (!examples.length) return
    let next = examples[Math.floor(Math.random() * examples.length)]
    if (examples.length > 1) {
      while (next === lastExampleRef.current[category]) {
        next = examples[Math.floor(Math.random() * examples.length)]
      }
    }
    lastExampleRef.current[category] = next
    onTextChange(next.slice(0, MAX_INPUT_LENGTH))
    setActiveExample(category)
    window.setTimeout(() => setActiveExample(null), 450)
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Mod<span className="text-primary">Eval</span>
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Compare how AI moderation models interpret content across platform contexts
        </p>
      </div>

      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Example Library
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => loadExample(category)}
              className={cn(
                "rounded-full border border-border/70 px-3 py-1 text-xs transition-all duration-200",
                activeExample === category
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content-input">Content Input</Label>
          <span className={cn("font-mono text-xs", counterTone)}>
            {text.length} / {MAX_INPUT_LENGTH}
          </span>
        </div>
        <Textarea
          id="content-input"
          value={text}
          onChange={(event) =>
            onTextChange(event.target.value.slice(0, MAX_INPUT_LENGTH))
          }
          placeholder="Paste the content you want to evaluate..."
          rows={10}
          className={cn(
            "min-h-40 resize-y bg-card/60",
            loading && "scanning-input",
          )}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Platform</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-primary">
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs leading-relaxed">
              {PLATFORM_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </div>

        <Dialog open={platformOpen} onOpenChange={setPlatformOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between bg-card/50"
            >
              <span>
                <span className="font-medium">{selectedPlatform.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {selectedPlatform.description}
                </span>
              </span>
              <ChevronDown className="size-4 opacity-60" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-border bg-card">
            <DialogHeader>
              <DialogTitle>Select platform policy</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {PLATFORMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPlatformChange(item.id)
                    setPlatformOpen(false)
                  }}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                    platform === item.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/70 hover:border-primary/30",
                  )}
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Collapsible open={policyOpen} onOpenChange={setPolicyOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-card/30 px-3 py-2 text-left">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Platform Policy Guidelines
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                policyOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-lg border border-border/60 bg-card/20 px-4 py-3">
            <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              {PLATFORM_POLICIES[platform].map((rule) => (
                <li key={rule}>• {rule}</li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground/80">
              Guidelines sourced from official platform documentation. Last verified May 2026.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {platform === "Custom" ? (
        <div className="space-y-2">
          <Label htmlFor="custom-policy">Custom Policy Notes</Label>
          <Textarea
            id="custom-policy"
            value={customPolicy}
            onChange={(event) =>
              onCustomPolicyChange(event.target.value.slice(0, MAX_INPUT_LENGTH))
            }
            rows={4}
            placeholder="Example: Zero tolerance for harassment. Flag political bias. Allow mild profanity."
            className="bg-card/60"
          />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-mono text-[11px] uppercase tracking-[0.12em]"
              onClick={() => {
                setPolicySaved(true)
                window.setTimeout(() => setPolicySaved(false), 2000)
              }}
            >
              Confirm Policy
            </Button>
            {policySaved ? (
              <span className="text-xs text-allow">✓ Policy saved</span>
            ) : null}
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        className="liquid-cta h-11 w-full font-medium"
        data-loading={loading}
        disabled={loading || !text.trim()}
        onMouseDown={() => {
          /* start liquid affordance immediately */
        }}
        onClick={onAnalyze}
      >
        {loading ? "Analyzing..." : "Execute Analysis"}
      </Button>
    </section>
  )
}
