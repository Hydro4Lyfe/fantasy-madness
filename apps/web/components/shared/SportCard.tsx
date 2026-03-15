import { cn } from "@/lib/utils";

interface SportCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "blue" | "emerald" | "amber" | "red" | "slate";
  header?: React.ReactNode;
}

const accentColors = {
  blue: "border-l-[#3B82F6]",
  emerald: "border-l-[#10B981]",
  amber: "border-l-[#F59E0B]",
  red: "border-l-[#F85149]",
  slate: "border-l-[#8B949E]",
};

export function SportCard({
  children,
  className,
  accent,
  header,
}: SportCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg shadow-sm",
        "hover:border-border/80 transition-colors duration-200",
        accent && `border-l-2 ${accentColors[accent]}`,
        className,
      )}
    >
      {header && (
        <div className="border-b border-border">{header}</div>
      )}
      {children}
    </div>
  );
}
