import { GlassCard } from "@/components/ui/GlassCard";
import { GoogleSignInButton } from "./GoogleSignInButton";

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

            <p className="text-xs text-white/50 text-center">
              By signing in, you agree to our terms of service.
            </p>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
