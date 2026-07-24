import { useEffect, useRef, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"

import {
  getFlowNodeMeta,
  renderFlowNodeContent,
  type FlowNodeId,
} from "@/components/how-it-works/flowContent"
import { cn } from "@/lib/utils"

/** Diagram shell (~780) + pad (~32) + drawer (~448) ≈ 1260; 1280 leaves a clear gap.
 *  Panel max-width must be ≥ this so the column does not center under the drawer. */
export const FLOW_DRAWER_SIDE_BY_SIDE_MIN = 1280

type FlowDetailDrawerProps = {
  nodeId: FlowNodeId | null
  onClose: () => void
  /** Overlay mode: select a diagram node under the scrim without dismissing. */
  onSelectNode?: (id: FlowNodeId) => void
}

function subscribeMinWidth(px: number, onChange: () => void) {
  const mq = window.matchMedia(`(min-width: ${px}px)`)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

/** True when viewport is wide enough for diagram + drawer side-by-side. */
export function useFlowDrawerSideBySide() {
  return useSyncExternalStore(
    (onChange) => subscribeMinWidth(FLOW_DRAWER_SIDE_BY_SIDE_MIN, onChange),
    () => window.matchMedia(`(min-width: ${FLOW_DRAWER_SIDE_BY_SIDE_MIN}px)`).matches,
    () => true
  )
}

export function FlowDetailDrawer({ nodeId, onClose, onSelectNode }: FlowDetailDrawerProps) {
  const open = nodeId !== null
  const meta = nodeId ? getFlowNodeMeta(nodeId) : null
  const panelRef = useRef<HTMLElement>(null)
  const sideBySide = useFlowDrawerSideBySide()
  const overlayMode = !sideBySide

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  // Side-by-side: click outside drawer closes, but diagram nodes stay clickable to switch.
  useEffect(() => {
    if (!open || overlayMode) return

    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      if (target.closest("[data-flow-node]")) return
      onClose()
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, overlayMode, onClose])

  useEffect(() => {
    if (!open || !overlayMode) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, overlayMode])

  if (!open || !meta) return null

  return createPortal(
    <>
      {overlayMode ? (
        <button
          type="button"
          aria-label="Dismiss detail panel"
          className="fixed inset-0 z-[60] bg-black/55 transition-opacity duration-300"
          onClick={(event) => {
            // Peek under the scrim so stage nodes stay switchable while dimmed.
            const scrim = event.currentTarget
            scrim.style.pointerEvents = "none"
            const under = document.elementFromPoint(event.clientX, event.clientY)
            scrim.style.pointerEvents = ""
            const attr = under?.closest?.("[data-flow-node]")?.getAttribute("data-flow-node")
            if (attr && onSelectNode) {
              onSelectNode(attr as FlowNodeId)
              return
            }
            onClose()
          }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] bg-black/20 transition-opacity duration-300"
        />
      )}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal={overlayMode}
        aria-labelledby="flow-drawer-title"
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex h-dvh w-full max-w-[min(28rem,100%)] flex-col",
          "border-l border-border bg-card shadow-2xl outline-none",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        <header className="shrink-0 border-b border-border/70 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {meta.eyebrow}
              </p>
              <h2 id="flow-drawer-title" className="mt-1 text-xl font-semibold text-foreground">
                {meta.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xs p-1 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-hidden"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm leading-relaxed text-muted-foreground">
          {renderFlowNodeContent(meta.id)}
        </div>
        <footer className="shrink-0 border-t border-border/70 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Close · Esc
          </button>
        </footer>
      </aside>
    </>,
    document.body
  )
}
