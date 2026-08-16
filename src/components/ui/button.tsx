import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`h-9 rounded-sm border border-foreground/50 bg-transparent px-3 text-sm font-semibold text-foreground hover:bg-foreground/5 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
