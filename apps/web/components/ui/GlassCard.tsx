export function GlassCard(props: { title?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      {props.title ? <h2 style={{ margin: "0 0 12px 0" }}>{props.title}</h2> : null}
      <div>{props.children}</div>
      {props.footer ? <div style={{ marginTop: 12 }}>{props.footer}</div> : null}
    </section>
  );
}
