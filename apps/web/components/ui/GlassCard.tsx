import { cn } from "@/lib/utils";

type GlassCardProps = {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  titleClassName?: string;
};

export function GlassCard({
  title,
  children,
  footer,
  className,
  titleClassName,
}: GlassCardProps) {
  return (
    <section className={cn("glass-card rounded-2xl p-4 shadow-xl", className)}>
      {title && (
        <h2 className={cn("m-0 mb-3 text-lg font-semibold text-white", titleClassName)}>
          {title}
        </h2>
      )}
      <div>{children}</div>
      {footer && <div className="mt-3">{footer}</div>}
    </section>
  );
}
