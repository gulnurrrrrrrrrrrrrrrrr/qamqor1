"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QrCode, MapPin } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ActionFeedback, ResultBox } from "@/components/ui/ActionFeedback";
import { QrScanner } from "@/components/attendance/QrScanner";
import { api } from "@/lib/api/client";

function CheckInContent() {
  const searchParams = useSearchParams();
  const urlTokenHandled = useRef(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [qrSuccess, setQrSuccess] = useState<string | null>(null);
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

  const submitQrCheckIn = useCallback(async (token: string) => {
    setQrLoading(true);
    setQrError(null);
    setQrSuccess(null);
    setResult("");
    try {
      const res = await api.checkInQr(token);
      setScannerOpen(false);
      setQrSuccess("Check-in successful!");
      setResult(
        `Checked in to ${res.eventTitle} (${res.org}) via ${res.method} at ${new Date(res.checkedInAt).toLocaleString()}`
      );
    } catch (e) {
      setQrError(e instanceof Error ? e.message : "Invalid or expired QR token");
    } finally {
      setQrLoading(false);
    }
  }, []);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl || urlTokenHandled.current) return;
    urlTokenHandled.current = true;
    void submitQrCheckIn(tokenFromUrl);
  }, [searchParams, submitQrCheckIn]);

  function openScanner() {
    setQrError(null);
    setQrSuccess(null);
    setScannerOpen(true);
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
          <p className="text-xs text-ink-400 mt-2 mb-4">Point your camera at the organizer&apos;s QR code</p>
          <Button className="w-full" onClick={openScanner} disabled={qrLoading || scannerOpen}>
            {qrLoading ? "Checking in…" : scannerOpen ? "Scanner active" : "Open Scanner"}
          </Button>
          <ActionFeedback loading={qrLoading} error={qrError} success={qrSuccess} />
          <QrScanner
            active={scannerOpen && !qrLoading}
            onScan={(token) => void submitQrCheckIn(token)}
            onClose={() => setScannerOpen(false)}
          />
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
