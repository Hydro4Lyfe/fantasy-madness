import { ESPN_LOGO_MAP } from "./espn-logo-map"

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/**
 * Resolve a team logo URL by full name (e.g., "Duke Blue Devils").
 * Returns the ESPN CDN URL if found, or null.
 */
export function getTeamLogoByName(fullName: string | null | undefined): string | null {
  if (!fullName) return null
  const key = normalize(fullName)
  return ESPN_LOGO_MAP[key] ?? null
}

/**
 * Get candidate logo URLs for a team.
 * Tries ESPN CDN by name first, then falls back to local files by team ID.
 */
export function getTeamLogoCandidates(
  teamId: number | null | undefined,
  fullName?: string | null,
): string[] {
  const candidates: string[] = []

  // Primary: ESPN CDN logo matched by full name
  const espnUrl = getTeamLogoByName(fullName)
  if (espnUrl) {
    candidates.push(espnUrl)
  }

  // Fallback: local files by team ID
  if (typeof teamId === "number" && Number.isFinite(teamId)) {
    const id = Math.trunc(teamId)
    candidates.push(
      `/team-logos/${id}.png`,
      `/team-logos/${id}.svg`,
      `/team-logos/${id}.jpg`,
      `/team-logos/${id}.jpeg`,
      `/team-logos/${id}.webp`,
    )
  }

  return candidates
}
