"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QrCode, MapPin } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ActionFeedback, ResultBox } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";

function CheckInContent() {
  const searchParams = useSearchParams();
  const [qrLoading, setQrLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [eventIds, setEventIds] = useState<string[]>([]);

  useEffect(() => {
    api.applications().then((apps) => {
      const ids = apps.applications
        .filter((a) => ["accepted", "approved", "reviewing"].includes(a.status))
        .map((a) => a.eventId);
      setEventIds(ids);
    }).catch(console.error);
  }, []);

  async function handleQrCheckIn() {
    setQrLoading(true);
    setQrError(null);
    setResult("");
    try {
      const tokenFromUrl = searchParams.get("token");
      const token = tokenFromUrl || window.prompt("Enter QR token from organizer")?.trim();
      if (!token) return;
      const res = await api.checkInQr(token);
      setResult(`Checked in to ${res.eventTitle} (${res.org}) via ${res.method} at ${new Date(res.checkedInAt).toLocaleString()}`);
    } catch (e) {
      setQrError(e instanceof Error ? e.message : "Check-in failed");
    } finally {
      setQrLoading(false);
    }
  }

  async function handleGeoCheckIn() {
    setGeoLoading(true);
    setGeoError(null);
    setResult("");
    try {
      if (eventIds.length === 0) throw new Error("No approved events available for geo check-in");
      const eventId = eventIds.length === 1 ? eventIds[0] : eventIds[parseInt(window.prompt(`Select event (1-${eventIds.length})`, "1") ?? "1", 10) - 1];
      if (!eventId) return;

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) reject(new Error("Geolocation not supported"));
        else navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });

      const res = await api.checkInGeo(eventId, position.coords.latitude, position.coords.longitude);
      setResult(`Checked in to ${res.eventTitle} (${res.org}) via ${res.method}${res.distanceMeters != null ? ` · ${res.distanceMeters}m from venue` : ""}`);
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : "Geo check-in failed");
    } finally {
      setGeoLoading(false);
    }
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
        <Panel className="text-center">
          <QrCode size={48} className="mx-auto text-accent-light mb-4" />
          <h3 className="text-sm font-medium text-white">Scan Event QR</h3>
          <p className="text-xs text-ink-400 mt-2 mb-4">Enter the QR token from your organizer</p>
          <Button className="w-full" onClick={handleQrCheckIn} disabled={qrLoading}>
            {qrLoading ? "Verifying…" : "Open Scanner"}
          </Button>
          <ActionFeedback loading={qrLoading} error={qrError} />
        </Panel>
        <Panel className="text-center">
          <MapPin size={48} className="mx-auto text-gold mb-4" />
          <h3 className="text-sm font-medium text-white">Geo Check-in</h3>
          <p className="text-xs text-ink-400 mt-2 mb-4">Uses your device location at the event</p>
          <Button variant="secondary" className="w-full" onClick={handleGeoCheckIn} disabled={geoLoading}>
            {geoLoading ? "Verifying…" : "Verify Location"}
          </Button>
          <ActionFeedback loading={geoLoading} error={geoError} />
        </Panel>
      </div>
      <ResultBox content={result} label="Check-in result" />
    </>
  );
}

export default function CheckInPage() {
  return (
    <RoleShell role="volunteer" title="Attendance Check-in" subtitle="QR scan · Geo verification">
      <Suspense fallback={<div className="h-32 animate-pulse bg-white/[0.04] rounded-xl" />}>
        <CheckInContent />
      </Suspense>
    </RoleShell>
  );
}
