import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (expected && secret !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const year = String(body?.year ?? "");
  const draftId = String(body?.draftId ?? "");

  if (year) revalidateTag(`tournament:${year}`);
  if (draftId) revalidateTag(`draft:${draftId}`);

  return NextResponse.json({ ok: true, revalidated: { year: year || null, draftId: draftId || null } });
}
