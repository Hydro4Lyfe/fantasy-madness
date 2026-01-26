import { forwardRef, InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, id, className, ...props },
  ref
) {
  const checkboxId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={checkboxId} className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`w-4 h-4 rounded cursor-pointer accent-indigo-500 ${className ?? ""}`}
          {...props}
        />
        {label}
      </label>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
