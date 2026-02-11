import { Prisma } from "@prisma/client";
import { DomainError } from "@fantasy-madness/domain";

export function mapPrismaError(e: unknown): DomainError {
  if (e instanceof DomainError) return e;

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return new DomainError("CONFLICT", "Unique constraint violation", { target: e.meta?.target });
    }
    if (e.code === "P2025") {
      return new DomainError("NOT_FOUND", "Record not found");
    }
  }

  return new DomainError("CONFLICT", "Unexpected database error");
}
