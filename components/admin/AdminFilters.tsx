"use client";

import { cn } from "@/lib/utils";

type FilterField = {
  key: string;
  label: string;
  type: "search" | "select";
  value: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

type Props = {
  fields: FilterField[];
  onChange: (key: string, value: string) => void;
  className?: string;
};

const inputClass =
  "rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent-light/40";

export function AdminFilters({ fields, onChange, className }: Props) {
  return (
    <div className={cn("flex flex-wrap gap-3 mb-4", className)}>
      {fields.map((f) =>
        f.type === "search" ? (
          <input
            key={f.key}
            type="search"
            value={f.value}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.placeholder ?? f.label}
            className={cn(inputClass, "min-w-[200px] flex-1")}
          />
        ) : (
          <select
            key={f.key}
            value={f.value}
            onChange={(e) => onChange(f.key, e.target.value)}
            className={cn(inputClass, "min-w-[140px]")}
            aria-label={f.label}
          >
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )
      )}
    </div>
  );
}
