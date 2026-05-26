"use client";

import { memo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const modes = ["All", "Online", "Offline", "Hybrid"];
const verify = ["All", "QR", "Geo", "Full Verify"];

interface FiltersProps {
  search: string;
  onSearch: (v: string) => void;
  mode: string;
  onMode: (v: string) => void;
  verification: string;
  onVerification: (v: string) => void;
}

export const Filters = memo(function Filters({ search, onSearch, mode, onMode, verification, onVerification }: FiltersProps) {
  return (
    <div className="glass-raised rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search events, skills, organizations..."
          className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent/40"
          aria-label="Search events"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <FilterGroup label="Format" options={modes} value={mode} onChange={onMode} />
        <FilterGroup label="Verification" options={verify} value={verification} onChange={onVerification} />
      </div>
    </div>
  );
});

const FilterGroup = memo(function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-ink-400 flex items-center gap-1"><SlidersHorizontal size={12} aria-hidden />{label}</span>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} className={cn("rounded-lg px-3 py-1 text-xs transition", value === o ? "bg-accent/20 text-accent-light" : "text-ink-300 hover:bg-white/[0.04]")}>{o}</button>
      ))}
    </div>
  );
});
