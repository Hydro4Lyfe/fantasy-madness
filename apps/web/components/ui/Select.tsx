import { forwardRef, SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, options, className, ...props },
  ref
) {
  const selectId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm text-white/90">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`px-3 py-2.5 rounded-lg border bg-white/5 text-white text-sm outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-colors ${
          error ? "border-red-500" : "border-white/15"
        } ${className ?? ""}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
