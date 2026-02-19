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
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
            Seed Weight
          </h3>
          <p className="text-[11px] text-[#8A8F98]/70 mt-1">
            Combined points-per-win value
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-[#EDEDEF] tabular-nums">
            {totalSeedWeight}
          </p>
          <p className="text-[10px] text-[#5E6AD2] tabular-nums font-mono">pts/w total</p>
        </div>
      </div>
    </div>
  )
}
