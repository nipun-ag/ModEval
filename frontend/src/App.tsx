import { useEffect, useState } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { InputPanel } from "@/components/analysis/InputPanel"
import { ResultsPanel } from "@/components/analysis/ResultsPanel"
import { HowItWorksPanel } from "@/components/how-it-works/HowItWorksPanel"
import { ModelsPanel } from "@/components/models/ModelsPanel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { analyzeText, fetchHealth, fetchModels } from "@/lib/api"
import { MAX_INPUT_LENGTH } from "@/data/models"
import type {
  AnalyzeResponse,
  NavPanel,
  PanelState,
  Platform,
  ResultsTab,
} from "@/types/api"

export default function App() {
  const [activePanel, setActivePanel] = useState<NavPanel>("analysis")
  const [text, setText] = useState("")
  const [platform, setPlatform] = useState<Platform>("Reddit")
  const [customPolicy, setCustomPolicy] = useState("")
  const [loading, setLoading] = useState(false)
  const [panelState, setPanelState] = useState<PanelState>("empty")
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ResultsTab>("summary")
  const [modelCountLabel, setModelCountLabel] = useState("8 Models Available")
  const [healthOk, setHealthOk] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStatus() {
      try {
        const [models, health] = await Promise.all([fetchModels(), fetchHealth()])
        if (cancelled) return
        setModelCountLabel(`${models.active_count} Models Available`)
        setHealthOk(health.status === "ok")
      } catch (error) {
        console.warn("Failed to load model status", error)
        if (!cancelled) setHealthOk(false)
      }
    }

    void loadStatus()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleAnalyze() {
    const payload = text.trim()
    if (!payload) return
    if (payload.length > MAX_INPUT_LENGTH) {
      setErrorMessage(`Text must be ${MAX_INPUT_LENGTH} characters or fewer.`)
      setPanelState("error")
      return
    }

    setLoading(true)
    setPanelState("loading")
    setErrorMessage(null)

    try {
      const response = await analyzeText({
        text: payload,
        platform,
        custom_policy_text: platform === "Custom" ? customPolicy : "",
      })
      setAnalysis(response)
      setActiveTab("summary")
      setPanelState("results")
    } catch (error) {
      setAnalysis(null)
      setErrorMessage(error instanceof Error ? error.message : "Request failed")
      setPanelState("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        <TopBar
          activePanel={activePanel}
          onNavigate={setActivePanel}
          modelCountLabel={modelCountLabel}
          healthOk={healthOk}
        />

        {activePanel === "analysis" ? (
          <main className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[38%_62%]">
            <InputPanel
              text={text}
              onTextChange={setText}
              platform={platform}
              onPlatformChange={setPlatform}
              customPolicy={customPolicy}
              onCustomPolicyChange={setCustomPolicy}
              loading={loading}
              onAnalyze={handleAnalyze}
            />

            <div>
              <ResultsPanel
                state={panelState}
                data={analysis}
                errorMessage={errorMessage}
                platform={platform}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </main>
        ) : null}

        {activePanel === "how-it-works" ? <HowItWorksPanel /> : null}
        {activePanel === "models" ? <ModelsPanel /> : null}
      </div>
    </TooltipProvider>
  )
}
