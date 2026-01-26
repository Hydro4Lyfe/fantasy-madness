import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...props },
  ref
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm text-white/90">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`px-3 py-2.5 rounded-lg border bg-white/5 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
          error ? "border-red-500" : "border-white/15"
        } ${className ?? ""}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
