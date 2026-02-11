"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Crown,
  Users,
  Target,
  Globe,
  ChevronRight,
} from "lucide-react";

type LeaderboardType = "global" | "drafts" | "contests";

export interface DraftLeaderboard {
  id: string;
  name: string;
  participants: number;
  yourRank: number | null;
  status: "active" | "draft" | "completed";
}

interface LeaderboardsClientProps {
  draftLeaderboards?: DraftLeaderboard[];
}

export function LeaderboardsClient({ draftLeaderboards = [] }: LeaderboardsClientProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>("drafts");

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("global")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "global"
                ? "text-orange-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Global Championship
            {activeTab === "global" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "drafts"
                ? "text-orange-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            My Drafts
            {activeTab === "drafts" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("contests")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "contests"
                ? "text-orange-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            My Contests
            {activeTab === "contests" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
            )}
          </button>
        </div>
      </div>

      {/* Global Tab */}
      {activeTab === "global" && (
        <div className="space-y-6">
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Global Championship</h2>
            <p className="text-muted-foreground mb-4">
              The global leaderboard will be available once the tournament begins.
            </p>
            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
              Coming Soon
            </Badge>
          </Card>
        </div>
      )}

      {/* Drafts Tab */}
      {activeTab === "drafts" && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">My Draft Leaderboards</h2>
                <p className="text-sm text-muted-foreground">
                  View standings for each of your drafts
                </p>
              </div>
            </div>

            {draftLeaderboards.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="font-semibold text-foreground mb-2">No Drafts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join or create a draft to see your standings here
                </p>
                <Link href="/drafts/new">
                  <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    Create Your First Draft
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {draftLeaderboards.map((draft) => (
                  <Link key={draft.id} href={`/drafts/${draft.id}`}>
                    <Card className="p-6 bg-background hover:border-orange-500/50 transition-all cursor-pointer group h-full">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 line-clamp-2">
                              {draft.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{draft.participants} players</span>
                            </div>
                          </div>
                          <Badge
                            className={
                              draft.status === "active"
                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                : draft.status === "draft"
                                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                  : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                            }
                          >
                            {draft.status === "active"
                              ? "Live"
                              : draft.status === "draft"
                                ? "Upcoming"
                                : "Ended"}
                          </Badge>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Your Rank
                            </span>
                            <div className="flex items-center gap-2">
                              {draft.yourRank === 1 && (
                                <Crown className="w-4 h-4 text-yellow-400" />
                              )}
                              <span
                                className={`text-lg font-bold ${
                                  draft.yourRank === 1
                                    ? "text-yellow-400"
                                    : draft.yourRank !== null && draft.yourRank <= 3
                                      ? "text-green-400"
                                      : ""
                                }`}
                              >
                                {draft.yourRank !== null ? `#${draft.yourRank}` : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Contests Tab */}
      {activeTab === "contests" && (
        <div className="space-y-6">
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">My Contests</h2>
            <p className="text-muted-foreground mb-4">
              Bracket contests will be available once the tournament begins.
            </p>
            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
              Coming Soon
            </Badge>
          </Card>
        </div>
      )}
    </div>
  );
}
