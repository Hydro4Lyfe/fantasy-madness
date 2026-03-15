import { type Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { HowToPlayContent } from "@/components/shared/HowToPlayContent";

export const metadata: Metadata = {
  title: "How to Play | Fantasy Madness",
  description:
    "Learn how Fantasy Madness works — scoring, game modes, pick windows, and leaderboards.",
};

export default async function HowToPlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="text-foreground overflow-x-hidden">
      <HowToPlayContent variant={user ? "app" : "marketing"} />
    </div>
  );
}
