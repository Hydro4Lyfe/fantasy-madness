import { createHash } from "node:crypto";

export function sha256Hex(input: unknown): string {
  const s = typeof input === "string" ? input : JSON.stringify(input);
  return createHash("sha256").update(s).digest("hex");
}
