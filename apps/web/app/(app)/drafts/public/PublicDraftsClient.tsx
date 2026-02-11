"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Users,
  Globe,
  Search,
  X,
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

interface PublicDraft {
  id: string;
  name: string;
  participants: number;
  maxParticipants: number;
  prizePool: number;
  entryFee: number;
  difficulty: "beginner" | "intermediate" | "expert";
  featured: boolean;
  spotsLeft: number;
  startDate: string;
}

interface PublicDraftsClientProps {
  drafts: PublicDraft[];
}

export function PublicDraftsClient({ drafts }: PublicDraftsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    entryFee: "all",
    difficulty: "all",
    prizePool: "all",
    availability: "all",
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "expert":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch = draft.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEntryFee =
      filters.entryFee === "all" ||
      (filters.entryFee === "free" && draft.entryFee === 0) ||
      (filters.entryFee === "paid" && draft.entryFee > 0);

    const matchesDifficulty =
      filters.difficulty === "all" || draft.difficulty === filters.difficulty;

    const matchesPrizePool =
      filters.prizePool === "all" ||
      (filters.prizePool === "under1k" && draft.prizePool < 1000) ||
      (filters.prizePool === "1k-5k" && draft.prizePool >= 1000 && draft.prizePool < 5000) ||
      (filters.prizePool === "5k-10k" && draft.prizePool >= 5000 && draft.prizePool <= 10000) ||
      (filters.prizePool === "over10k" && draft.prizePool > 10000);

    const percentFilled = (draft.participants / draft.maxParticipants) * 100;
    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "filling-fast" && percentFilled >= 70) ||
      (filters.availability === "open" && percentFilled < 70);

    return (
      matchesSearch &&
      matchesEntryFee &&
      matchesDifficulty &&
      matchesPrizePool &&
      matchesAvailability
    );
  });

  const featuredDrafts = filteredDrafts.filter((d) => d.featured);
  const regularDrafts = filteredDrafts.filter((d) => !d.featured);

  const clearFilters = () => {
    setFilters({
      entryFee: "all",
      difficulty: "all",
      prizePool: "all",
      availability: "all",
    });
    setSearchQuery("");
  };

  const activeFilterCount = Object.values(filters).filter((f) => f !== "all").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Public Drafts</h1>
          <p className="text-muted-foreground">Discover and join competitions worldwide</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search public drafts by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-background border-border h-12 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredDrafts.length} of {drafts.length} public drafts
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6 bg-card border-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Filter Options</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Entry Fee Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Entry Fee
              </label>
              <div className="space-y-2">
                {["all", "free", "paid"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="entryFee"
                      value={option}
                      checked={filters.entryFee === option}
                      onChange={(e) => setFilters({ ...filters, entryFee: e.target.value })}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="text-sm text-foreground capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Difficulty
              </label>
              <div className="space-y-2">
                {["all", "beginner", "intermediate", "expert"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value={option}
                      checked={filters.difficulty === option}
                      onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="text-sm text-foreground capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prize Pool Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                Prize Pool
              </label>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All" },
                  { value: "under1k", label: "Under $1K" },
                  { value: "1k-5k", label: "$1K - $5K" },
                  { value: "5k-10k", label: "$5K - $10K" },
                  { value: "over10k", label: "Over $10K" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="prizePool"
                      value={option.value}
                      checked={filters.prizePool === option.value}
                      onChange={(e) => setFilters({ ...filters, prizePool: e.target.value })}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Availability
              </label>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                  { value: "filling-fast", label: "Filling Fast" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={filters.availability === option.value}
                      onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Featured Drafts */}
      {featuredDrafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
            <h2 className="text-xl font-bold text-foreground">Featured Drafts</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDrafts.map((draft) => (
              <Card
                key={draft.id}
                className="bg-card border-2 border-orange-500/50 hover:border-orange-500 transition-all group cursor-pointer relative"
              >
                <Link href={`/drafts/${draft.id}`}>
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Featured
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Trophy className="w-7 h-7 text-orange-400" />
                      </div>
                      <Badge className={`${getDifficultyColor(draft.difficulty)}`}>
                        {draft.difficulty}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {draft.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Starts {draft.startDate}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee</span>
                        <span className="font-bold text-orange-400">
                          {draft.entryFee === 0 ? "Free" : `$${draft.entryFee}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool</span>
                        <span className="font-bold text-green-400">
                          ${draft.prizePool.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Spots Left</span>
                        <span
                          className={`font-bold ${draft.spotsLeft < 20 ? "text-red-400" : "text-foreground"}`}
                        >
                          {draft.spotsLeft}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{draft.participants} joined</span>
                        <span>
                          {Math.round((draft.participants / draft.maxParticipants) * 100)}% full
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full transition-all"
                          style={{
                            width: `${(draft.participants / draft.maxParticipants) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 h-10">
                      Join Now
                    </Button>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Drafts */}
      {regularDrafts.length > 0 && (
        <div className="space-y-4">
          {featuredDrafts.length > 0 && (
            <h2 className="text-xl font-bold text-foreground">All Public Drafts</h2>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularDrafts.map((draft) => (
              <Card
                key={draft.id}
                className="bg-card border-border hover:border-orange-500/50 transition-all group cursor-pointer"
              >
                <Link href={`/drafts/${draft.id}`}>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Globe className="w-6 h-6 text-blue-400" />
                      </div>
                      <Badge className={`${getDifficultyColor(draft.difficulty)}`}>
                        {draft.difficulty}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {draft.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Starts {draft.startDate}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee</span>
                        <span className="font-bold text-orange-400">
                          {draft.entryFee === 0 ? "Free" : `$${draft.entryFee}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool</span>
                        <span className="font-bold text-green-400">
                          ${draft.prizePool.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Spots Left</span>
                        <span
                          className={`font-bold ${draft.spotsLeft < 20 ? "text-red-400" : "text-foreground"}`}
                        >
                          {draft.spotsLeft}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{draft.participants} joined</span>
                        <span>
                          {Math.round((draft.participants / draft.maxParticipants) * 100)}% full
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                          style={{
                            width: `${(draft.participants / draft.maxParticipants) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 h-10">
                      Join Now
                    </Button>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDrafts.length === 0 && (
        <Card className="p-12 bg-card border-border text-center">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No drafts found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </Card>
      )}
    </div>
  );
}
