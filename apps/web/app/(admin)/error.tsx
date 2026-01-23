"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h2 style={{ margin: 0 }}>Admin error</h2>
      <pre style={{ whiteSpace: "pre-wrap", opacity: 0.85, border: "1px solid rgba(255,255,255,0.15)", padding: 12, borderRadius: 12 }}>
        {error.message}
      </pre>
      <button onClick={() => reset()} style={{ width: 160, padding: "8px 12px" }}>
        Try again
      </button>
    </div>
  );
}
