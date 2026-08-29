import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-moss text-white hover:bg-ink focus:ring-moss",
  secondary: "border border-zinc-300 bg-white text-ink hover:border-zinc-400 hover:bg-zinc-50 focus:ring-moss",
  ghost: "text-ink hover:bg-zinc-100 focus:ring-moss",
  danger: "bg-clay text-white hover:bg-clay/90 focus:ring-clay"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
