"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/server/actions/auth";
import {
  Trophy,
  Globe,
  Crown,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Shield,
  ChevronDown,
  Home,
  BookOpen,
  MessageSquareWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedbackDialog } from "./FeedbackDialog";

interface NavBarProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

const playModes = [
  {
    href: "/global-contest",
    label: "Global Contest",
    description: "Pick any 8 teams, compete against everyone",
    icon: Globe,
    color: "text-[#3B82F6]",
  },
  {
    href: "/drafts",
    label: "My Drafts",
    description: "Snake draft with friends for the best picks",
    icon: Zap,
    color: "text-[#10B981]",
  },
  {
    href: "/leagues",
    label: "My Leagues",
    description: "Create or join a group, pick independently",
    icon: Shield,
    color: "text-[#F59E0B]",
  },
];

export function NavBar({ user }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const playRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const displayName = user.username ?? user.name ?? "Player";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isHome = pathname === "/dashboard";
  const isPlay =
    pathname.startsWith("/global-contest") ||
    pathname.startsWith("/drafts") ||
    pathname.startsWith("/leagues");
  const isStandings =
    pathname.startsWith("/leaderboards") || pathname.startsWith("/history");
  const isHowToPlay = pathname === "/how-to-play";

  // Close play dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (playRef.current && !playRef.current.contains(e.target as Node)) {
        setPlayOpen(false);
      }
    }
    if (playOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [playOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setPlayOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117] border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0">
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <img
                src="/FantasyMadness_Variant2_Icon.svg"
                alt=""
                className="h-10 w-auto"
              />
              <div className="flex items-baseline gap-0.5">
                <span className="text-foreground font-semibold text-lg tracking-tight leading-none">
                  Fantasy
                </span>
                <span className="text-primary font-semibold text-lg tracking-tight leading-none">
                  Madness
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop nav - 3 items: Home, Play dropdown, Standings */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {/* Home */}
            <Link
              href="/dashboard"
              className={cn(
                "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors",
                isHome
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Home className="w-4 h-4" />
              Home
              {isHome && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            {/* Play dropdown */}
            <div ref={playRef} className="relative">
              <button
                onClick={() => setPlayOpen((o) => !o)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium transition-colors",
                  isPlay
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Trophy className="w-4 h-4" />
                Play
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    playOpen && "rotate-180",
                  )}
                />
                {isPlay && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>

              {/* Dropdown */}
              {playOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  {playModes.map((mode) => {
                    const Icon = mode.icon;
                    const active = pathname.startsWith(mode.href);
                    return (
                      <Link
                        key={mode.href}
                        href={mode.href}
                        onClick={() => setPlayOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors",
                          active
                            ? "bg-accent"
                            : "hover:bg-accent",
                        )}
                      >
                        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", mode.color)} />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {mode.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {mode.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Standings */}
            <Link
              href="/leaderboards"
              className={cn(
                "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors",
                isStandings
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Standings
              {isStandings && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            {/* How to Play */}
            <Link
              href="/how-to-play"
              className={cn(
                "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors",
                isHowToPlay
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BookOpen className="w-4 h-4" />
              How to Play
              {isHowToPlay && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Points pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-border bg-secondary/50 text-muted-foreground">
              <Crown className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-xs">0 pts</span>
            </div>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open profile menu"
                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-border hover:ring-primary/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Avatar className="w-full h-full">
                    <AvatarImage src={user.image ?? undefined} alt={displayName} />
                    <AvatarFallback className="text-xs font-medium text-foreground bg-primary/20">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-56 rounded-lg p-1.5 bg-card border border-border shadow-xl"
              >
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border flex-shrink-0">
                      <Avatar className="w-full h-full">
                        <AvatarImage src={user.image ?? undefined} alt={displayName} />
                        <AvatarFallback className="text-xs font-medium text-foreground bg-primary/20">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.username ? `@${user.username}` : "Player"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border my-1" />

                <DropdownMenuItem
                  asChild
                  className="h-9 rounded-md px-3 gap-2.5 text-sm cursor-pointer text-muted-foreground focus:text-foreground focus:bg-accent transition-colors duration-150"
                >
                  <Link href="/settings">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => setFeedbackOpen(true)}
                  className="h-9 rounded-md px-3 gap-2.5 text-sm cursor-pointer text-muted-foreground focus:text-foreground focus:bg-accent transition-colors duration-150"
                >
                  <MessageSquareWarning className="w-4 h-4" />
                  Send Feedback
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="h-9 rounded-md px-3 gap-2.5 text-sm cursor-pointer text-red-400/70 focus:text-red-400 focus:bg-red-500/[0.08] transition-colors duration-150"
                >
                  <form action={signOut} className="w-full">
                    <button type="submit" className="w-full flex items-center gap-2.5">
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        aria-hidden={!mobileOpen}
        className={cn(
          "md:hidden absolute left-0 right-0 top-14",
          "bg-[#0d1117] border-b border-border",
          "shadow-xl",
          "transition-all duration-200 ease-out",
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none",
        )}
      >
        {mobileOpen && (
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="px-3 py-3 space-y-1">
          {/* Home */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              isHome
                ? "text-foreground bg-accent border-l-2 border-l-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          {/* Play section */}
          <div className="pt-2 pb-1">
            <span className="px-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Play
            </span>
          </div>
          {playModes.map((mode) => {
            const Icon = mode.icon;
            const active = pathname.startsWith(mode.href);
            return (
              <Link
                key={mode.href}
                href={mode.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "text-foreground bg-accent border-l-2 border-l-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <Icon className={cn("w-4 h-4", mode.color)} />
                {mode.label}
              </Link>
            );
          })}

          {/* Standings */}
          <div className="pt-2 pb-1">
            <span className="px-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Standings
            </span>
          </div>
          <Link
            href="/leaderboards"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              isStandings
                ? "text-foreground bg-accent border-l-2 border-l-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <BarChart3 className="w-4 h-4" />
            Leaderboards & History
          </Link>

          {/* How to Play */}
          <div className="pt-2 pb-1">
            <span className="px-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Help
            </span>
          </div>
          <Link
            href="/how-to-play"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              isHowToPlay
                ? "text-foreground bg-accent border-l-2 border-l-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <BookOpen className="w-4 h-4" />
            How to Play
          </Link>

          {/* Send Feedback */}
          <button
            onClick={() => {
              setMobileOpen(false);
              setFeedbackOpen(true);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent w-full text-left"
          >
            <MessageSquareWarning className="w-4 h-4" />
            Send Feedback
          </button>
        </div>
      </div>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </nav>
  );
}
