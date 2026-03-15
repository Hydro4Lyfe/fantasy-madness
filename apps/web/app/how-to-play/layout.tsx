import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/server/dal/queries/users.getProfile";
import { NavBar } from "@/components/layout/NavBar";

export default async function HowToPlayLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged-in: wrap with the app NavBar
  if (user) {
    let profile;
    try {
      profile = await getUserProfile({ userId: user.id });
    } catch {
      // If profile fetch fails, fall through to marketing layout
      profile = null;
    }

    if (profile) {
      return (
        <div className="min-h-screen bg-background">
          <NavBar
            user={{
              id: profile.id,
              name: profile.name,
              username: profile.username,
              image: profile.image,
            }}
          />
          <div className="relative pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </div>
      );
    }
  }

  // Logged-out: marketing chrome
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Marketing Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-1.5">
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

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/#modes"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Game Modes
              </Link>
              <Link
                href="/#scoring"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Scoring
              </Link>
              <Link
                href="/how-to-play"
                className="text-sm text-foreground font-medium transition-colors duration-200"
                aria-current="page"
              >
                How to Play
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white",
                  "bg-primary hover:bg-primary/90",
                  "shadow-[0_0_0_1px_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                  "transition-all duration-200 active:scale-[0.98]"
                )}
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile CTA */}
            <Link
              href="/signup"
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Content with nav offset */}
      <div className="pt-20">{children}</div>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img
            src="/FantasyMadness_Variant1_Full.svg"
            alt="Fantasy Madness"
            className="h-6 w-auto opacity-60"
          />
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link
              href="/how-to-play"
              className="hover:text-foreground transition-colors"
            >
              How to Play
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
            <span>&copy; 2026 Fantasy Madness</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
