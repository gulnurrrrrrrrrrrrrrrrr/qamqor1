"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import type { Event, EventMode, VerificationType } from "@/lib/types";

export type EventFormValues = {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  hours: number;
  maxParticipants: number;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  verification: "QR" | "GEO" | "HYBRID";
  trustRequired: number;
};

const inputClass =
  "w-full rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent-light/40";

const labelClass = "block text-xs text-ink-400 mb-1.5";

function defaultFormValues(): EventFormValues {
  return {
    title: "",
    description: "",
    location: "",
    eventDate: new Date().toISOString().slice(0, 10),
    hours: 8,
    maxParticipants: 20,
    mode: "OFFLINE",
    verification: "QR",
    trustRequired: 50,
  };
}

function eventToFormValues(event: Event): EventFormValues {
  const modeMap: Record<EventMode, EventFormValues["mode"]> = {
    online: "ONLINE",
    offline: "OFFLINE",
    hybrid: "HYBRID",
  };
  const verificationMap: Record<VerificationType, EventFormValues["verification"]> = {
    qr: "QR",
    geo: "GEO",
    hybrid: "HYBRID",
    manual: "HYBRID",
  };

  return {
    title: event.title,
    description: event.description ?? "",
    location: event.location,
    eventDate: event.eventDate ? event.eventDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    hours: event.hours,
    maxParticipants: event.maxParticipants,
    mode: modeMap[event.mode] ?? "OFFLINE",
    verification: verificationMap[event.verification] ?? "QR",
    trustRequired: event.trustRequired,
  };
}

function validateForm(values: EventFormValues): string | null {
  if (!values.title.trim()) return "Title is required";
  if (!values.location.trim()) return "Location is required";
  if (!values.eventDate) return "Date is required";
  if (!Number.isFinite(values.hours) || values.hours < 1) return "Hours must be at least 1";
  if (!Number.isFinite(values.maxParticipants) || values.maxParticipants < 1) {
    return "Max participants must be at least 1";
  }
  if (!Number.isFinite(values.trustRequired) || values.trustRequired < 0 || values.trustRequired > 100) {
    return "Trust required must be between 0 and 100";
  }
  return null;
}

type Props = {
  open: boolean;
  mode: "create" | "edit";
  event?: Event | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function CreateEventModal({ open, mode, event, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<EventFormValues>(defaultFormValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(mode === "edit" && event ? eventToFormValues(event) : defaultFormValues());
  }, [open, mode, event]);

  if (!open) return null;

  function updateField<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      location: form.location.trim(),
      eventDate: new Date(form.eventDate).toISOString(),
      hours: Number(form.hours),
      maxParticipants: Number(form.maxParticipants),
      mode: form.mode,
      verification: form.verification,
      trustRequired: Number(form.trustRequired),
      skills: [] as string[],
    };

    try {
      if (mode === "edit" && event) {
        await api.updateEvent(event.id, payload);
        onSuccess("Event updated successfully");
      } else {
        await api.createEvent(payload);
        onSuccess("Event created successfully");
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-overlay-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col glass-raised rounded-2xl animate-modal-in"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 shrink-0">
          <h2 id="event-modal-title" className="text-sm font-medium text-white">
            {mode === "edit" ? "Edit Event" : "Create Event"}
          </h2>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelClass} htmlFor="event-title">Title *</label>
            <input
              id="event-title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
              placeholder="Community Clean-up Day"
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={cnTextarea(inputClass)}
              placeholder="Describe the event goals, schedule, and what volunteers will do…"
              rows={4}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="event-location">Location *</label>
            <input
              id="event-location"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
              placeholder="Almaty, Kazakhstan"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="event-date">Date *</label>
              <input
                id="event-date"
                type="date"
                value={form.eventDate}
                onChange={(e) => updateField("eventDate", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="event-hours">Hours *</label>
              <input
                id="event-hours"
                type="number"
                min={1}
                value={form.hours}
                onChange={(e) => updateField("hours", Number(e.target.value))}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="event-max">Max participants *</label>
              <input
                id="event-max"
                type="number"
                min={1}
                value={form.maxParticipants}
                onChange={(e) => updateField("maxParticipants", Number(e.target.value))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="event-trust">Trust required *</label>
              <input
                id="event-trust"
                type="number"
                min={0}
                max={100}
                value={form.trustRequired}
                onChange={(e) => updateField("trustRequired", Number(e.target.value))}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="event-mode">Mode</label>
              <select
                id="event-mode"
                value={form.mode}
                onChange={(e) => updateField("mode", e.target.value as EventFormValues["mode"])}
                className={inputClass}
              >
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="event-verification">Verification</label>
              <select
                id="event-verification"
                value={form.verification}
                onChange={(e) => updateField("verification", e.target.value as EventFormValues["verification"])}
                className={inputClass}
              >
                <option value="QR">QR</option>
                <option value="GEO">Geo</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (mode === "edit" ? "Saving…" : "Creating…") : mode === "edit" ? "Save changes" : "Create"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

function cnTextarea(base: string) {
  return `${base} resize-y min-h-[96px]`;
}
