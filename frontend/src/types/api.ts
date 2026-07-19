export type Platform =
  | "Reddit"
  | "Discord"
  | "Facebook"
  | "Instagram"
  | "Custom"

export type Action = "Allow" | "Review" | "Remove" | "Disabled" | "Error" | "No Consensus"

export interface ModelResult {
  model: string
  top_category?: string
  confidence?: number
  action?: string
  flagged?: boolean
  explanation?: string
  aligned?: boolean
  alignment_reason?: string
  disabled?: boolean
  error?: string
}

export interface Disagreements {
  action_mismatch?: string[]
  category_mismatch?: string[]
}

export interface Insights {
  strictest_model?: { model: string; action: string }
  most_lenient_model?: { model: string; action: string }
  consensus_recommendation?: string
}

export interface AiAnalysis {
  disagreement_explanation?: string
  risk_narrative?: string
  context_sensitivity?: string
  contested_category?: string
}

export interface AnalyzeResponse {
  results: ModelResult[]
  disagreements: Disagreements
  insights: Insights
  ai_analysis: AiAnalysis
}

export interface ModelsResponse {
  active_count: number
  total_count: number
}

export interface AnalyzeRequest {
  text: string
  platform: Platform
  custom_policy_text?: string
}

export type NavPanel = "analysis" | "how-it-works" | "models"
export type ResultsTab = "summary" | "breakdown" | "insights"
export type PanelState = "empty" | "loading" | "results" | "error"
