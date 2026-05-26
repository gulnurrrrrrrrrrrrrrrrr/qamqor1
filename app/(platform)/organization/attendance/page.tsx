"use client";

import { QrCode, MapPin, ShieldCheck } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";

export default function OrgAttendancePage() {
  return (
    <RoleShell role="organization" title="Attendance" subtitle="QR · Geo · Validation">
      <div className="grid sm:grid-cols-3 gap-4">
        <Can permission="qr.generate">
          <Panel>
            <QrCode className="text-accent-light mb-3" size={22} />
            <h3 className="text-sm text-white">Generate QR</h3>
            <p className="text-xs text-ink-400 mt-1 mb-3">Event check-in codes</p>
            <Button size="sm" variant="secondary" className="w-full">Generate</Button>
          </Panel>
        </Can>
        <Can permission="attendance.verify">
          <Panel>
            <MapPin className="text-gold mb-3" size={22} />
            <h3 className="text-sm text-white">Geo Zone</h3>
            <p className="text-xs text-ink-400 mt-1 mb-3">Configure geofence</p>
            <Button size="sm" variant="secondary" className="w-full">Configure</Button>
          </Panel>
        </Can>
        <Panel>
          <ShieldCheck className="text-emerald-400 mb-3" size={22} />
          <h3 className="text-sm text-white">Validate</h3>
          <p className="text-xs text-ink-400 mt-1 mb-3">3 pending reviews</p>
          <Button size="sm" className="w-full">Review</Button>
        </Panel>
      </div>
    </RoleShell>
  );
}
