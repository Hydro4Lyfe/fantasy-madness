import { NextResponse } from "next/server";

// MVP polling endpoint for draft rooms.
// Later: upgrade to SSE/WebSockets.
export async function GET(_req: Request, ctx: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await ctx.params;

  // TODO: DAL query: getDraftState(draftId)
  return NextResponse.json({ ok: true, draftId, state: "TODO" });
}
