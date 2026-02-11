import {
  getLeagueById,
  listLeaguesForUser,
  getLeagueByInviteCode,
  getLeagueRoomState,
  getLeagueLeaderboard,
  getLeagueForEdit,
  listPublicLeagues,
  type LeagueListRow,
  type LeagueDTO,
  type LeagueByInviteCode,
  type LeagueRoomStateDTO,
  type LeagueLeaderboardDTO,
  type LeagueEditDTO,
  type PublicLeagueListRow,
} from "@/server/dal";

export type {
  LeagueListRow,
  LeagueDTO,
  LeagueByInviteCode,
  LeagueRoomStateDTO,
  LeagueLeaderboardDTO,
  LeagueEditDTO,
  PublicLeagueListRow,
};

export async function listLeaguesForUserQuery(
  userId: string
): Promise<LeagueListRow[]> {
  return listLeaguesForUser({ userId });
}

export async function getLeagueByIdQuery(leagueId: string): Promise<LeagueDTO> {
  return getLeagueById({ leagueId });
}

export async function getLeagueByInviteCodeQuery(
  inviteCode: string,
  userId?: string
): Promise<LeagueByInviteCode> {
  return getLeagueByInviteCode({ inviteCode, userId });
}

export async function getLeagueRoomStateQuery(
  leagueId: string,
  userId: string
): Promise<LeagueRoomStateDTO> {
  return getLeagueRoomState({ leagueId, userId });
}

export async function getLeagueLeaderboardQuery(
  leagueId: string
): Promise<LeagueLeaderboardDTO> {
  return getLeagueLeaderboard({ leagueId });
}

export async function getLeagueForEditQuery(
  leagueId: string,
  userId: string
): Promise<LeagueEditDTO> {
  return getLeagueForEdit({ leagueId, userId });
}

export async function listPublicLeaguesQuery(
  tournamentId?: string
): Promise<PublicLeagueListRow[]> {
  return listPublicLeagues({ tournamentId });
}
