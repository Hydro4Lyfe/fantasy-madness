export type PageParams = { limit: number; cursor?: string };

export function clampLimit(n: number, max = 100) {
  return Math.max(1, Math.min(max, n));
}
