"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AdminDetailDrawer({ open, title, onClose, children, footer }: Props) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-raised border-l border-white/[0.06] flex flex-col animate-modal-in"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-sm font-medium text-white">{title}</h2>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-ink-300 space-y-3">{children}</div>
        {footer && <div className="border-t border-white/[0.06] px-5 py-4 flex flex-wrap gap-2">{footer}</div>}
      </aside>
    </>
  );
}
