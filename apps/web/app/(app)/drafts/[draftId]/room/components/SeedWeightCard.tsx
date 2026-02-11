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
    <div className="rounded-lg border border-border/30 bg-card/20 p-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Seed Weight
          </h3>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Combined points-per-win value
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground tabular-nums">
            {totalSeedWeight}
          </p>
          <p className="text-[10px] text-green-400/80 tabular-nums">pts/w total</p>
        </div>
      </div>
    </div>
  )
}
