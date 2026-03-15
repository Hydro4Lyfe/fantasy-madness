import { cn } from "@/lib/utils";

interface StatBlockProps {
  value: string | number;
  label: string;
  className?: string;
  valueClassName?: string;
}

export function StatBlock({
  value,
  label,
  className,
  valueClassName,
}: StatBlockProps) {
  return (
    <div className={cn("text-center", className)}>
      <div
        className={cn(
          "font-display text-2xl font-bold uppercase tracking-tight text-foreground",
          valueClassName,
        )}
      >
        {value}
      </div>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}
