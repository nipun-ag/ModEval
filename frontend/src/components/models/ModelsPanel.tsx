import { MODEL_CATALOG } from "@/data/modelCatalog"
import { Badge } from "@/components/ui/badge"

export function ModelsPanel() {
  const enterprise = MODEL_CATALOG.filter((model) => model.tier === "enterprise")
  const opensource = MODEL_CATALOG.filter((model) => model.tier === "opensource")

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 px-4 py-8 sm:px-8">
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          Inference Pipeline
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Models</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Eight independent AI models, each trained on different datasets to detect a distinct
          safety dimension.
        </p>
      </section>

      <Tier title="Enterprise APIs" models={enterprise} />
      <Tier title="Open Source Models" models={opensource} />
    </div>
  )
}

function Tier({
  title,
  models,
}: {
  title: string
  models: typeof MODEL_CATALOG
}) {
  return (
    <section className="space-y-4">
      <div className="border-b border-border/70 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {models.map((model) => (
          <article
            key={model.id}
            className="rounded-2xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <span className="live-dot" />
                {model.name}
              </h3>
              <Badge variant="outline" className="font-mono text-[10px]">
                {model.arch}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{model.creator}</p>
            <p className="mt-3 text-sm text-foreground/90">Detects: {model.detects}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong className="text-foreground/80">Trained on</strong> {model.trained}
            </p>

            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Strengths
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {model.strengths.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Limitations
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {model.limitations.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <a
              href={model.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex text-xs text-primary hover:underline"
            >
              {model.linkLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
