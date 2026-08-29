import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-moss text-white hover:bg-ink focus:ring-moss",
  secondary: "border border-ink/12 bg-white text-ink hover:border-moss/50 hover:bg-sage/35 focus:ring-moss",
  ghost: "text-ink hover:bg-ink/5 focus:ring-moss",
  danger: "bg-clay text-white hover:bg-clay/90 focus:ring-clay"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
