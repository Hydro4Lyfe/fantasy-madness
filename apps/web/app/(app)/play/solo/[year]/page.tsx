import Link from "next/link";

export default async function SoloModePage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Solo — {year}</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Overview of solo mode for a tournament. Usually a CTA into your entry.
      </p>
      <Link href={`/play/solo/${year}/entry`}>Go to my entry</Link>
    </main>
  );
}
