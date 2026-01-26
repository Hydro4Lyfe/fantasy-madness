import { GlassCard } from "@/components/ui/GlassCard";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { EmailSignInButton } from "./EmailSignInButton";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Fantasy Madness</h1>
          <p className="text-white/70">Sign in to continue</p>
        </div>

        <GlassCard>
          <div className="grid gap-4">
            <GoogleSignInButton searchParams={searchParams} />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/40 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <EmailSignInButton />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/40 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <p className="text-sm text-white/70 text-center">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">
                Sign up
              </Link>
            </p>

            <p className="text-xs text-white/50 text-center">
              By signing in, you agree to our terms of service.
            </p>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
