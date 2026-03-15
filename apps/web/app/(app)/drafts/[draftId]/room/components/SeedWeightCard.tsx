"use client"

interface Pick {
  slotId: string
  seed: number
}

interface SeedWeightCardProps {
  picks: Pick[]
}

export function SeedWeightCard({ picks }: SeedWeightCardProps) {
  const totalSeedWeight = picks.reduce((sum, pick) => sum + pick.seed, 0)

  return (
    <div
      className="rounded-2xl border border-border p-3 bg-card"
      style={{
        boxShadow: "0 0 0 1px rgba(48,54,61,0.6), 0 2px 20px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Seed Weight
          </h3>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Combined points-per-win value
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-xl font-bold tabular-nums"
            style={
              totalSeedWeight > 0
                ? {
                    background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #93C5FD 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "dr-shimmer 4s linear infinite",
                  }
                : { color: "#EDEDEF" }
            }
          >
            {totalSeedWeight}
          </p>
          <p className="text-[10px] tabular-nums font-mono" style={{ color: "#3B82F6" }}>
            pts/w total
          </p>
        </div>
      </div>

      {/* Mini progress bar showing picks filled */}
      {picks.length > 0 && (
        <div className="mt-3 h-px bg-border/40">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: "100%",
              background: "linear-gradient(90deg, rgba(59,130,246,0.5), rgba(96,165,250,0.7))",
            }}
          />
        </div>
      )}
    </div>
  )
}
