import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>404</h1>
      <p style={{ opacity: 0.85 }}>That page doesn’t exist (yet).</p>
      <Link href="/">Go home</Link>
    </main>
  );
}
