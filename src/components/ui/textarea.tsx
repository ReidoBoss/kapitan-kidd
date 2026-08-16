import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-24 rounded-sm border border-foreground/35 bg-background px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
