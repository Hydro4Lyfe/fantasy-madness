export function getTeamLogoCandidates(teamId: number | null | undefined): string[] {
  if (typeof teamId !== "number" || !Number.isFinite(teamId)) {
    return []
  }

  const id = Math.trunc(teamId)
  return [
    `/team-logos/${id}.png`,
    `/team-logos/${id}.svg`,
    `/team-logos/${id}.jpg`,
    `/team-logos/${id}.jpeg`,
    `/team-logos/${id}.webp`,
  ]
}
