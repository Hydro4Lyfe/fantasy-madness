import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  // TODO: Fetch real data from DAL queries
  // For now, using mock data similar to Figma design

  const mockUserData = {
    name: "Player",
    totalPoints: 1247,
    rank: 47,
    totalPlayers: 2847,
    activeDrafts: 3,
    activeContests: 2,
    winRate: 67,
    wins: 8,
    total: 12,
  };

  const mockLeaderboard = [
    { rank: 1, name: "Sarah Chen", points: 2847, change: "up" as const, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    { rank: 2, name: "Mike Johnson", points: 2756, change: "up" as const, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    { rank: 3, name: "Alex Rivera", points: 2689, change: "down" as const, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    { rank: 4, name: "Emily Davis", points: 2634, change: "same" as const, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
    { rank: 5, name: "Chris Taylor", points: 2598, change: "up" as const, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
  ];

  const mockDrafts = [
    {
      id: "1",
      name: "Office Champions League",
      type: "private" as const,
      participants: 8,
      maxParticipants: 8,
      status: "active" as const,
      draftDate: "Mar 15, 2026",
      myRank: 3,
    },
    {
      id: "2",
      name: "Friends & Family Draft",
      type: "private" as const,
      participants: 6,
      maxParticipants: 8,
      status: "draft" as const,
      draftDate: "Mar 18, 2026",
      myRank: null,
    },
    {
      id: "3",
      name: "Weekend Warriors Draft",
      type: "private" as const,
      participants: 8,
      maxParticipants: 8,
      status: "active" as const,
      draftDate: "Mar 16, 2026",
      myRank: 5,
    },
  ];

  const mockContests = [
    {
      id: "1",
      name: "College Alumni Tournament",
      type: "private" as const,
      participants: 45,
      maxParticipants: 100,
      status: "active" as const,
      startDate: "Mar 15, 2026",
      myRank: 12,
    },
    {
      id: "2",
      name: "High Stakes Challenge",
      type: "public" as const,
      participants: 156,
      maxParticipants: 200,
      status: "active" as const,
      startDate: "Mar 16, 2026",
      myRank: 34,
    },
  ];

  return (
    <DashboardClient
      user={mockUserData}
      leaderboard={mockLeaderboard}
      drafts={mockDrafts}
      contests={mockContests}
    />
  );
}
