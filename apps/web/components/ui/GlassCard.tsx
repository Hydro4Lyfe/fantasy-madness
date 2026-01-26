export function GlassCard(props: { title?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="border border-white/10 bg-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {props.title && <h2 className="m-0 mb-3 text-lg font-semibold">{props.title}</h2>}
      <div>{props.children}</div>
      {props.footer && <div className="mt-3">{props.footer}</div>}
    </section>
  );
}
