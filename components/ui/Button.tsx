import type React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold";

const styles: Record<Variant, string> = {
  primary: "bg-white text-ink hover:bg-ink-100 shadow-lg shadow-white/10",
  secondary: "glass text-white hover:bg-white/[0.06]",
  ghost: "text-ink-200 hover:text-white hover:bg-white/[0.04]",
  gold: "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", href, className, children, ...props }: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200",
    styles[variant],
    size === "sm" && "px-4 py-2 text-sm",
    size === "md" && "px-6 py-2.5 text-sm",
    size === "lg" && "px-8 py-3 text-base",
    className
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...props}>{children}</button>;
}
