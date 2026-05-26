import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  open: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  investigating: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-ink-500/10 text-ink-300 border-white/10",
  flagged: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-ink-500/10 text-ink-300 border-white/10",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium",
        STYLES[key] ?? "bg-white/5 text-ink-300 border-white/10",
        className
      )}
    >
      {status}
    </span>
  );
}
