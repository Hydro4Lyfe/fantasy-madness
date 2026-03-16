"use server";

import { prisma } from "@fantasy-madness/db";
import {
  createLeague,
  joinLeague,
  leaveLeague,
  updateLeague,
  saveLeaguePicks,
  kickLeagueParticipant,
  banLeagueParticipant,
  unbanLeagueParticipant,
} from "@/server/dal";
import {
  CreateLeagueInputSchema,
  SaveLeaguePicksInputSchema,
} from "@fantasy-madness/domain";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireUserId } from "@/server/auth/guards";

// ---------- Create League ----------

export type CreateLeagueFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  leagueId?: string;
};

export async function createLeagueAction(
  _prevState: CreateLeagueFormState,
  formData: FormData
): Promise<CreateLeagueFormState> {
  const userId = await requireUserId();

  const rawData = {
    name: formData.get("name"),
    tournamentId: formData.get("tournamentId"),
    isPrivate: formData.get("isPrivate") === "on",
    maxParticipants: formData.get("maxParticipants") || undefined,
  };

  const parsed = CreateLeagueInputSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field) fieldErrors[String(field)] = issue.message;
    }
    return { success: false, error: "Validation failed", fieldErrors };
  }

  try {
    const result = await createLeague({
      db: prisma,
      input: { ...parsed.data, userId },
    });

    redirect(`/leagues/${result.leagueId}`);
  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { success: false, error: e?.message ?? "Failed to create league" };
  }
}

// ---------- Join League ----------

export type JoinLeagueResult = {
  success: boolean;
  error?: string;
};

export async function joinLeagueAction(
  leagueId: string
): Promise<JoinLeagueResult> {
  const userId = await requireUserId();

  try {
    await joinLeague({
      db: prisma,
      input: { leagueId, userId },
    });

    revalidatePath(`/leagues/${leagueId}`);
    return { success: true };
  } catch (e: any) {
    if (e?.code === "LEAGUE_FULL") {
      return { success: false, error: "This league is full" };
    }
    if (e?.code === "BANNED_FROM_LEAGUE") {
      return { success: false, error: "You are banned from this league" };
    }
    return { success: false, error: e?.message ?? "Failed to join league" };
  }
}

export async function joinLeagueByInviteAction(
  inviteCode: string
): Promise<JoinLeagueResult> {
  const userId = await requireUserId();

  // Find league by invite code
  const league = await prisma.league.findUnique({
    where: { inviteCode },
    select: { id: true, status: true },
  });

  if (!league) {
    return { success: false, error: "Invalid invite code" };
  }

  if (league.status !== "OPEN") {
    return {
      success: false,
      error: "This league is no longer accepting participants",
    };
  }

  try {
    await joinLeague({
      db: prisma,
      input: { leagueId: league.id, userId },
    });

    revalidatePath(`/leagues/${league.id}`);
  } catch (e: any) {
    if (e?.code === "LEAGUE_FULL") {
      return { success: false, error: "This league is full" };
    }
    if (e?.code === "BANNED_FROM_LEAGUE") {
      return { success: false, error: "You are banned from this league" };
    }
    return { success: false, error: e?.message ?? "Failed to join league" };
  }

  redirect(`/leagues/${league.id}`);
}

// ---------- Leave League ----------

export async function leaveLeagueAction(leagueId: string) {
  const userId = await requireUserId();

  try {
    await leaveLeague({
      db: prisma,
      input: { leagueId, userId },
    });

    revalidatePath(`/leagues/${leagueId}`);
    redirect("/leagues");
  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { success: false, error: e?.message ?? "Failed to leave league" };
  }
}

// ---------- Update League ----------

export async function updateLeagueAction(
  leagueId: string,
  data: { name?: string; isPrivate?: boolean; maxParticipants?: number | null }
) {
  const userId = await requireUserId();

  try {
    await updateLeague({
      db: prisma,
      input: {
        leagueId,
        userId,
        ...data,
      },
    });

    revalidatePath(`/leagues/${leagueId}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Failed to update league",
    };
  }
}

// ---------- Save Picks ----------

export type SaveLeaguePicksFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveLeaguePicksAction(
  _prevState: SaveLeaguePicksFormState,
  formData: FormData
): Promise<SaveLeaguePicksFormState> {
  const userId = await requireUserId();

  const leagueId = formData.get("leagueId") as string;
  const slotsRaw = formData.get("slotIds") as string;

  let slotIds: string[];
  try {
    slotIds = JSON.parse(slotsRaw);
  } catch {
    return { success: false, error: "Invalid slot data" };
  }

  const parsed = SaveLeaguePicksInputSchema.safeParse({ leagueId, slotIds });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field) fieldErrors[String(field)] = issue.message;
    }
    return { success: false, error: "Validation failed", fieldErrors };
  }

  try {
    await saveLeaguePicks({
      db: prisma,
      input: { ...parsed.data, userId },
    });

    revalidatePath(`/leagues/${leagueId}`);
    revalidateTag("leaderboard");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to save picks" };
  }
}

// Non-form version for programmatic use
export async function saveLeaguePicksDirectAction(
  leagueId: string,
  slotIds: string[]
) {
  const userId = await requireUserId();

  const parsed = SaveLeaguePicksInputSchema.safeParse({ leagueId, slotIds });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await saveLeaguePicks({
      db: prisma,
      input: { ...parsed.data, userId },
    });

    revalidatePath(`/leagues/${leagueId}`);
    revalidateTag("leaderboard");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to save picks" };
  }
}

// ---------- Kick Participant ----------

export async function kickLeagueParticipantAction(
  leagueId: string,
  participantUserId: string
) {
  const userId = await requireUserId();

  try {
    await kickLeagueParticipant({
      db: prisma,
      input: {
        leagueId,
        hostUserId: userId,
        participantUserId,
      },
    });

    revalidatePath(`/leagues/${leagueId}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Failed to kick participant",
    };
  }
}

// ---------- Ban Participant ----------

export async function banLeagueParticipantAction(
  leagueId: string,
  participantUserId: string,
  reason?: string
) {
  const userId = await requireUserId();

  try {
    await banLeagueParticipant({
      db: prisma,
      input: {
        leagueId,
        hostUserId: userId,
        participantUserId,
        reason,
      },
    });

    revalidatePath(`/leagues/${leagueId}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Failed to ban participant",
    };
  }
}

// ---------- Unban Participant ----------

export async function unbanLeagueParticipantAction(
  leagueId: string,
  participantUserId: string
) {
  const userId = await requireUserId();

  try {
    await unbanLeagueParticipant({
      db: prisma,
      input: {
        leagueId,
        hostUserId: userId,
        participantUserId,
      },
    });

    revalidatePath(`/leagues/${leagueId}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "Failed to unban participant",
    };
  }
}
