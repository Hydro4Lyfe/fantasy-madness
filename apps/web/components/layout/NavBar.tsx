"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Archive,
  Target,
} from "lucide-react";

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
  const [showNavMenu, setShowNavMenu] = useState(false);
  const pathname = usePathname();

  const displayName = user.username ?? user.name ?? "Player";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger Menu - Mobile Only */}
          <div className="relative md:hidden">
            <button
              onClick={() => setShowNavMenu(!showNavMenu)}
              className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Navigation Dropdown */}
            {showNavMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNavMenu(false)}
                />
                <Card className="absolute left-0 top-12 w-60 p-2 bg-card/95 backdrop-blur-sm border-border/80 z-50 shadow-2xl">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowNavMenu(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                          isActiveRoute(item.href)
                            ? "text-primary bg-primary/10"
                            : "text-foreground hover:bg-muted/70"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </Card>
              </>
            )}
          </div>

          {/* Logo - Centered on Mobile, Left on Desktop */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
            <Link href="/dashboard">
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                FantasyMadness
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={
                    isActiveRoute(item.href)
                      ? "text-primary bg-primary/10 hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Right Side - Points & User Menu */}
          <div className="flex items-center gap-3">
            {/* Points Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Crown className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">0 pts</span>
            </div>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-orange-500/40 hover:ring-orange-500 transition-all bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={user.image ?? undefined} alt={displayName} />
                    <AvatarFallback className="text-sm font-medium text-foreground bg-muted">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-64 rounded-xl border-border/80 bg-card/95 backdrop-blur-sm p-2 shadow-2xl"
              >
                <DropdownMenuLabel className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-border/70">
                      <AvatarImage src={user.image ?? undefined} alt={displayName} />
                      <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.id}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1.5" />

                <DropdownMenuItem asChild className="h-10 rounded-lg px-3">
                  <Link href="/settings" className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="h-10 rounded-lg px-3 text-red-400 focus:text-red-300 focus:bg-red-500/10">
                  <form action={signOut} className="w-full">
                    <button type="submit" className="w-full flex items-center gap-2.5 text-left">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
