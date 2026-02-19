import { Globe } from "lucide-react";
import { requireUserId } from "@/server/auth/guards";
import { getGlobalContestOverview } from "@/server/dal";
import { GlobalContestClient } from "./GlobalContestClient";

export default async function GlobalContestPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  const isPreviewEmpty =
    process.env.NODE_ENV !== "production" && params.preview === "empty";
  const userId = await requireUserId();
  const data = isPreviewEmpty ? null : await getGlobalContestOverview({ userId });

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4)]">
        <div className="w-12 h-12 mx-auto rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center mb-4">
          <Globe className="w-6 h-6 text-[#5E6AD2]" />
        </div>
        <h1 className="text-xl font-semibold text-[#EDEDEF] mb-2">No Contest Available</h1>
        <p className="text-sm text-[#8A8F98]">
          No global contest is available right now. Check back soon.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <p className="text-xs text-[#8A8F98] mt-2">
            Preview mode is available at{" "}
            <code className="font-mono">/global-contest?preview=empty</code>
          </p>
        )}
      </div>
    );
  }

  return <GlobalContestClient data={data} />;
}
