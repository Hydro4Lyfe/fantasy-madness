import { GlassCard } from "@/components/ui/GlassCard";
import { SignUpForm } from "./SignUpForm";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Fantasy Madness</h1>
          <p className="text-white/70">Create your account</p>
        </div>

        <GlassCard>
          <div className="grid gap-4">
            <SignUpForm />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/40 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <p className="text-sm text-white/70 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
