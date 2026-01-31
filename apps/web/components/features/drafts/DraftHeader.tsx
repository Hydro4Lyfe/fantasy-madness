export function DraftHeader(props: { vm: { title: string; statusLabel: string } }) {
  return (
    <div className="flex items-end gap-3">
      <h1 className="m-0 text-2xl font-bold text-white">{props.vm.title}</h1>
      <span className="px-3 py-1 text-xs font-semibold rounded-full border border-white/20 text-white/80">
        {props.vm.statusLabel}
      </span>
    </div>
  );
}
