"use client";

import { memo, useState } from "react";
import { X, Check } from "lucide-react";
import type { Event } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface ApplyModalProps {
  event: Event | null;
  onClose: () => void;
  onConfirm?: () => Promise<unknown>;
}

export const ApplyModal = memo(function ApplyModal({ event, onClose, onConfirm }: ApplyModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!event) return null;

  const trust = user?.trustScore ?? 0;
  const meetsTrust = trust >= event.trustRequired;

  async function handleConfirm() {
    if (!onConfirm) { onClose(); return; }
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-overlay-in" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 glass-raised rounded-2xl p-6 animate-modal-in">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-ink-400 hover:text-white" aria-label="Close"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent-light">{event.orgLogo}</div>
          <div>
            <p className="text-xs text-ink-400">{event.org}</p>
            <h3 className="text-sm font-medium text-white">{event.title}</h3>
          </div>
        </div>
        <p className="text-sm text-ink-300 mb-6">
          Your Trust Score ({trust}) {meetsTrust ? "meets" : "does not meet"} the requirement ({event.trustRequired}+).
        </p>
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleConfirm} disabled={loading || !meetsTrust}><Check size={16} aria-hidden /> {loading ? "Submitting…" : "Confirm Apply"}</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </>
  );
});
