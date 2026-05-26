import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("glass-raised rounded-2xl p-5 sm:p-6", className)}>{children}</div>;
}
