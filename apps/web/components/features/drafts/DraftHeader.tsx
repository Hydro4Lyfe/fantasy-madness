export function DraftHeader(props: { vm: { title: string; statusLabel: string } }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
      <h1 style={{ margin: 0 }}>{props.vm.title}</h1>
      <span style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 999 }}>
        {props.vm.statusLabel}
      </span>
    </div>
  );
}
