"use client";

import { useEffect, useState } from "react";
import { QrCode, MapPin, ShieldCheck } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { QrCodeDisplay } from "@/components/attendance/QrCodeDisplay";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api/client";
import type { Event } from "@/lib/types";

type QrData = { eventTitle: string; qrToken: string; checkInUrl: string };

export default function OrgAttendancePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [qrSuccess, setQrSuccess] = useState<string | null>(null);
  const [geoSuccess, setGeoSuccess] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [reviewList, setReviewList] = useState<{ id: string; volunteer: string; event: string; status: string; trust: number }[]>([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!user?.organizationId) return;
    api.events({ organizationId: user.organizationId }).then((r) => setEvents(r.events)).catch(console.error);
  }, [user?.organizationId]);

  function pickEventId(): string | undefined {
    if (events.length === 0) throw new Error("Create an event first");
    if (events.length === 1) return events[0].id;
    const titles = events.map((e, i) => `${i + 1}. ${e.title}`).join("\n");
    const choice = window.prompt(`Select event number:\n${titles}`, "1");
    if (!choice) return undefined;
    const idx = parseInt(choice, 10) - 1;
    if (idx < 0 || idx >= events.length) throw new Error("Invalid event selection");
    return events[idx].id;
  }

  async function handleGenerateQr() {
    setQrLoading(true);
    setQrError(null);
    setQrSuccess(null);
    setQrData(null);
    try {
      const eventId = pickEventId();
      const res = await api.generateQr(eventId);
      setQrData({
        eventTitle: res.eventTitle,
        qrToken: res.qrToken,
        checkInUrl: res.checkInUrl,
      });
      setQrSuccess(`QR generated for ${res.eventTitle}`);
    } catch (e) {
      setQrError(e instanceof Error ? e.message : "Failed to generate QR");
    } finally {
      setQrLoading(false);
    }
  }

  async function handleConfigureGeo() {
    setGeoLoading(true);
    setGeoError(null);
    setGeoSuccess(null);
    try {
      const eventId = pickEventId();
      if (!eventId) return;
      const lat = parseFloat(window.prompt("Latitude", "43.238") ?? "");
      const lng = parseFloat(window.prompt("Longitude", "76.945") ?? "");
      const radius = parseInt(window.prompt("Radius (meters)", "100") ?? "100", 10);
      if (Number.isNaN(lat) || Number.isNaN(lng)) throw new Error("Invalid coordinates");

      const res = await api.configureGeo({ eventId, latitude: lat, longitude: lng, radiusMeters: radius });
      setGeoSuccess(`Geo zone saved for ${res.eventTitle} (${res.radiusMeters}m radius)`);
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : "Failed to configure geo");
    } finally {
      setGeoLoading(false);
    }
  }

  async function handleReview() {
    setReviewLoading(true);
    setReviewError(null);
    try {
      const res = await api.attendanceReview();
      setReviewList(res.pending);
      setShowReview(true);
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <RoleShell role="organization" title="Attendance" subtitle="QR · Geo · Validation">
      <div className="grid sm:grid-cols-3 gap-4">
        <Can permission="qr.generate">
          <Panel>
            <QrCode className="text-accent-light mb-3" size={22} />
            <h3 className="text-sm text-white">Generate QR</h3>
            <p className="text-xs text-ink-400 mt-1 mb-3">Event check-in codes</p>
            <Button size="sm" variant="secondary" className="w-full" onClick={handleGenerateQr} disabled={qrLoading}>
              {qrLoading ? "Generating…" : "Generate"}
            </Button>
            <ActionFeedback loading={qrLoading} error={qrError} success={qrSuccess} />
            {qrData && (
              <QrCodeDisplay
                eventTitle={qrData.eventTitle}
                qrToken={qrData.qrToken}
                checkInUrl={qrData.checkInUrl}
              />
            )}
          </Panel>
        </Can>
        <Can permission="attendance.verify">
          <Panel>
            <MapPin className="text-gold mb-3" size={22} />
            <h3 className="text-sm text-white">Geo Zone</h3>
            <p className="text-xs text-ink-400 mt-1 mb-3">Configure geofence</p>
            <Button size="sm" variant="secondary" className="w-full" onClick={handleConfigureGeo} disabled={geoLoading}>
              {geoLoading ? "Saving…" : "Configure"}
            </Button>
            <ActionFeedback loading={geoLoading} error={geoError} success={geoSuccess} />
          </Panel>
        </Can>
        <Panel>
          <ShieldCheck className="text-emerald-400 mb-3" size={22} />
          <h3 className="text-sm text-white">Validate</h3>
          <p className="text-xs text-ink-400 mt-1 mb-3">Pending application reviews</p>
          <Button size="sm" className="w-full" onClick={handleReview} disabled={reviewLoading}>
            {reviewLoading ? "Loading…" : "Review"}
          </Button>
          <ActionFeedback loading={reviewLoading} error={reviewError} />
        </Panel>
      </div>
      {showReview && (
        <Panel className="mt-6 !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-medium text-white">Pending reviews ({reviewList.length})</h2>
          </div>
          {reviewList.length === 0 ? (
            <p className="p-6 text-sm text-ink-400 text-center">No pending applications.</p>
          ) : (
            reviewList.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm text-white">{item.volunteer}</p>
                  <p className="text-xs text-ink-400">{item.event} · Trust {item.trust}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => api.updateApplication(item.id, "approved").then(handleReview)}>Approve</Button>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => api.updateApplication(item.id, "rejected").then(handleReview)}>Reject</Button>
                </div>
              </div>
            ))
          )}
        </Panel>
      )}
    </RoleShell>
  );
}
