import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  isLoading,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-gradient-to-br from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600",
    secondary: "bg-white/10 text-white border border-white/15 hover:bg-white/15",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
