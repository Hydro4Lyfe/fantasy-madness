import { cn } from "@/lib/utils";

type StatusType = "live" | "open" | "locked" | "complete" | "eliminated" | "drafting";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; classes: string }> = {
  live: {
    label: "LIVE",
    classes: "bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30",
  },
  open: {
    label: "OPEN",
    classes: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
  },
  drafting: {
    label: "DRAFTING",
    classes: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
  },
  locked: {
    label: "LOCKED",
    classes: "bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30",
  },
  complete: {
    label: "COMPLETE",
    classes: "bg-[#8B949E]/15 text-[#8B949E] border-[#8B949E]/30",
  },
  eliminated: {
    label: "OUT",
    classes: "bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border",
        config.classes,
        className,
      )}
    >
      {(status === "live" || status === "drafting") && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              status === "live" ? "bg-[#F85149]" : "bg-[#3B82F6]",
            )}
            style={{ animation: "pulse-live 2s ease-in-out infinite" }}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-1.5 w-1.5",
              status === "live" ? "bg-[#F85149]" : "bg-[#3B82F6]",
            )}
          />
        </span>
      )}
      {config.label}
    </span>
  );
}
