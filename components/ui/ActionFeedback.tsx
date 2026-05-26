import { cn } from "@/lib/utils";

export function ActionFeedback({
  loading,
  error,
  success,
  className,
}: {
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  className?: string;
}) {
  if (!loading && !error && !success) return null;
  return (
    <p
      className={cn(
        "text-xs mt-3",
        loading && "text-ink-400",
        error && "text-red-400",
        success && "text-emerald-400",
        className
      )}
    >
      {loading ? "Working…" : error ?? success}
    </p>
  );
}

export function ResultBox({ content, label }: { content: string; label?: string }) {
  if (!content) return null;
  return (
    <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
      {label && <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-2">{label}</p>}
      <pre className="text-xs text-ink-200 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">{content}</pre>
    </div>
  );
}
