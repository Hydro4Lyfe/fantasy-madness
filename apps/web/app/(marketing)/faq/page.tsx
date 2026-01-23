export default function FaqPage() {
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 880 }}>
      <h1 style={{ margin: 0 }}>FAQ</h1>
      <div>
        <h3 style={{ marginBottom: 6 }}>When do picks lock?</h3>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Depends on the tournament state. The tournament hub will show lock windows.
        </p>
      </div>
      <div>
        <h3 style={{ marginBottom: 6 }}>Is this real-time?</h3>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          MVP uses caching + periodic refresh. Draft rooms can poll; later you can upgrade to SSE/WebSockets.
        </p>
      </div>
    </main>
  );
}
