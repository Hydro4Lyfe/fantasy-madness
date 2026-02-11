export type DomainErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "DRAFT_FULL"
  | "ALREADY_JOINED"
  | "SEAT_TAKEN"
  | "INVALID_STATE"
  | "CONFLICT"
  | "LEAGUE_FULL"
  | "BANNED_FROM_LEAGUE";

export class DomainError extends Error {
  constructor(
    public code: DomainErrorCode,
    message: string,
    public meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "DomainError";
  }
}
