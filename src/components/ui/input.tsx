import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-9 rounded-sm border border-foreground/35 bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
