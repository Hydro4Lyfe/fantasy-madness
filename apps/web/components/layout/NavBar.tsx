"use client";

import { useState } from "react";
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
  Users,
  Globe,
  Crown,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Archive,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavBarProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Globe },
  { href: "/global-contest", label: "Global Contest", icon: Trophy },
  { href: "/drafts", label: "Drafts", icon: Users },
  { href: "/leagues", label: "Leagues", icon: Target },
  { href: "/leaderboards", label: "Leaderboards", icon: BarChart3 },
  { href: "/history", label: "History", icon: Archive },
];

export function NavBar({ user }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const displayName = user.username ?? user.name ?? "Player";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-[#050506]/80 backdrop-blur-xl",
        "border-b border-white/[0.06]",
        "shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.5)]",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* ---- Mobile: hamburger ---- */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className={cn(
              "md:hidden w-9 h-9 flex items-center justify-center rounded-lg",
              "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06]",
              "border border-transparent hover:border-white/[0.06]",
              "transition-all duration-200",
            )}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* ---- Logo ---- */}
          <div className="absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0">
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <img
                src="/FantasyMadness_Variant2_Icon.svg"
                alt=""
                className="h-10 w-auto"
              />
              <div className="flex items-baseline gap-0.5">
                <span className="text-[#EDEDEF] font-semibold text-lg tracking-tight leading-none">
                  Fantasy
                </span>
                <span className="text-[#5E6AD2] font-semibold text-lg tracking-tight leading-none">
                  Madness
                </span>
              </div>
            </Link>
          </div>

          {/* ---- Desktop nav ---- */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                    active
                      ? "text-[#EDEDEF] bg-white/[0.08] border border-white/[0.06]"
                      : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] border border-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200",
                      active ? "text-[#5E6AD2]" : "text-current",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* ---- Right side ---- */}
          <div className="flex items-center gap-2.5">
            {/* Points pill */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-sm",
                "border border-white/[0.06] bg-white/[0.04]",
                "text-[#8A8F98]",
              )}
            >
              <Crown className="w-3.5 h-3.5 text-[#5E6AD2]" />
              <span className="font-mono text-xs">0 pts</span>
            </div>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open profile menu"
                  className={cn(
                    "w-8 h-8 rounded-full overflow-hidden flex-shrink-0",
                    "ring-2 ring-white/[0.10] hover:ring-[#5E6AD2]/60",
                    "transition-all duration-200 focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50",
                  )}
                >
                  <Avatar className="w-full h-full">
                    <AvatarImage src={user.image ?? undefined} alt={displayName} />
                    <AvatarFallback className="text-xs font-medium text-[#EDEDEF] bg-[#5E6AD2]/20">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className={cn(
                  "w-56 rounded-2xl p-1.5",
                  "bg-[#0a0a0c] border border-white/[0.08]",
                  "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.7),0_0_60px_rgba(0,0,0,0.4)]",
                )}
              >
                {/* User label */}
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/[0.08] flex-shrink-0">
                      <Avatar className="w-full h-full">
                        <AvatarImage src={user.image ?? undefined} alt={displayName} />
                        <AvatarFallback className="text-xs font-medium text-[#EDEDEF] bg-[#5E6AD2]/20">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#EDEDEF] truncate">{displayName}</p>
                      <p className="text-xs text-[#8A8F98] truncate">
                        {user.username ? `@${user.username}` : "Player"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/[0.06] my-1" />

                <DropdownMenuItem
                  asChild
                  className={cn(
                    "h-9 rounded-xl px-3 gap-2.5 text-sm cursor-pointer",
                    "text-[#8A8F98] focus:text-[#EDEDEF]",
                    "focus:bg-white/[0.06]",
                    "transition-colors duration-150",
                  )}
                >
                  <Link href="/settings">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className={cn(
                    "h-9 rounded-xl px-3 gap-2.5 text-sm cursor-pointer",
                    "text-red-400/70 focus:text-red-400",
                    "focus:bg-red-500/[0.08]",
                    "transition-colors duration-150",
                  )}
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

      {/* ---- Mobile nav panel ---- */}
      <div
        aria-hidden={!mobileOpen}
        className={cn(
          "md:hidden absolute left-0 right-0 top-14",
          "bg-[#050506]/95 backdrop-blur-xl",
          "border-b border-white/[0.06]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
          "transition-all duration-200 ease-out",
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none",
        )}
      >
        {/* Backdrop tap to close */}
        {mobileOpen && (
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                  active
                    ? "text-[#EDEDEF] bg-white/[0.08] border border-white/[0.06]"
                    : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] border border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    active ? "text-[#5E6AD2]" : "text-current",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
