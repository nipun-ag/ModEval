import type { Disagreements, Insights, ModelResult } from "@/types/api"
import { MODEL_DISPLAY } from "@/data/models"

export function actionTone(action?: string): "allow" | "review" | "remove" | "error" {
  const value = (action || "").toLowerCase()
  if (value === "allow") return "allow"
  if (value === "remove") return "remove"
  if (value === "error" || value === "disabled") return "error"
  return "review"
}

export function modelDisplay(modelName: string) {
  return (
    MODEL_DISPLAY[modelName] ?? {
      name: modelName,
      subtitle: "",
      chip: "model",
    }
  )
}

export function activeResults(results: ModelResult[]) {
  return results.filter((result) => !result.disabled && !result.error)
}

export function getDisagreementItems(disagreements?: Disagreements) {
  const items: Array<{
    key: string
    type: string
    description: string
    models: string[]
  }> = []

  if ((disagreements?.action_mismatch?.length ?? 0) > 1) {
    items.push({
      key: "action_mismatch",
      type: "Action Mismatch",
      description: "Models disagree on the final moderation recommendation.",
      models: disagreements!.action_mismatch!,
    })
  }

  if ((disagreements?.category_mismatch?.length ?? 0) > 1) {
    items.push({
      key: "category_mismatch",
      type: "Category Mismatch",
      description: "Models flagged different primary risk categories.",
      models: disagreements!.category_mismatch!,
    })
  }

  return items
}

export function generateConsensusSummary(
  results: ModelResult[],
  _insights?: Insights,
  disagreements?: Disagreements,
) {
  const active = activeResults(results)
  if (!active.length) return ""

  const total = active.length
  const actions = { allow: [] as string[], review: [] as string[], remove: [] as string[] }

  active.forEach((result) => {
    const tone = actionTone(result.action)
    if (tone in actions) actions[tone as keyof typeof actions].push(result.model)
  })

  const removeCount = actions.remove.length
  const reviewCount = actions.review.length
  const allowCount = actions.allow.length

  let verdict = ""
  if (removeCount === total) {
    verdict = `All ${total} models recommend removal.`
  } else if (allowCount === total) {
    verdict = `All ${total} models cleared this content.`
  } else if (removeCount > allowCount && removeCount > reviewCount) {
    verdict = `${removeCount} of ${total} models recommend removal.`
  } else if (allowCount > removeCount && allowCount > reviewCount) {
    verdict = `${allowCount} of ${total} models cleared this content.`
  } else {
    verdict = `Models are split — ${removeCount} remove, ${reviewCount} review, ${allowCount} allow.`
  }

  const categoryCounts: Record<string, number> = {}
  active.forEach((result) => {
    if (result.top_category) {
      categoryCounts[result.top_category] = (categoryCounts[result.top_category] || 0) + 1
    }
  })

  const primaryCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
  const signalSentence = primaryCategory
    ? `Primary signal: ${primaryCategory[0]}.`
    : "No dominant signal category identified."

  let disagreementSentence = ""
  const disagreementItems = getDisagreementItems(disagreements)
  if (disagreementItems.some((item) => item.type === "Action Mismatch")) {
    if (reviewCount > 0) {
      disagreementSentence = `Notable disagreement: ${actions.review
        .map((model) => modelDisplay(model).name)
        .join(", ")} flagged for review only.`
    } else if (allowCount > 0) {
      disagreementSentence = `Notable disagreement: ${actions.allow
        .map((model) => modelDisplay(model).name)
        .join(", ")} cleared this content.`
    }
  }

  return [verdict, signalSentence, disagreementSentence].filter(Boolean).join(" ")
}

export function donutSegments(results: ModelResult[]) {
  const active = activeResults(results)
  const counts = { Remove: 0, Review: 0, Allow: 0 }

  active.forEach((result) => {
    const tone = actionTone(result.action)
    if (tone === "remove") counts.Remove += 1
    else if (tone === "allow") counts.Allow += 1
    else if (tone === "review") counts.Review += 1
  })

  const ordered = [
    { label: "Remove", count: counts.Remove, color: "var(--remove)" },
    { label: "Review", count: counts.Review, color: "var(--review)" },
    { label: "Allow", count: counts.Allow, color: "var(--allow)" },
  ] as const

  const dominant = [...ordered].sort((a, b) => b.count - a.count)[0]

  return { ordered, total: active.length, dominant }
}

export function findingTag(consensusRecommendation?: string) {
  const consensus = (consensusRecommendation || "").trim()
  if (consensus === "Remove") {
    return { className: "violation", text: "CLEAR VIOLATION" }
  }
  if (consensus === "Allow") {
    return { className: "safe", text: "CLEAR SAFE" }
  }
  // Review or No Consensus → ambiguous / grey area
  return { className: "grey", text: "AMBIGUOUS" }
}
