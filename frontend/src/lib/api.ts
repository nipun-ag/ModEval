import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ModelsResponse,
} from "@/types/api"

const API_BASE = import.meta.env.DEV ? "/api" : "https://modeval-api.bynipun.com"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : `Request failed (${response.status})`
    throw new Error(message)
  }

  return data as T
}

export function fetchModels() {
  return request<ModelsResponse>("/models")
}

export function fetchHealth() {
  return request<{ status: string }>("/health")
}

export function analyzeText(payload: AnalyzeRequest) {
  return request<AnalyzeResponse>("/analyze", {
    method: "POST",
    body: JSON.stringify({
      custom_policy_text: "",
      ...payload,
    }),
  })
}
