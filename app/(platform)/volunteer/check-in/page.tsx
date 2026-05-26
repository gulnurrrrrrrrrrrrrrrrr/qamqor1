"use client";

import { QrCode, MapPin } from "lucide-react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

export default function CheckInPage() {
  return (
    <RoleShell role="volunteer" title="Attendance Check-in" subtitle="QR scan · Geo verification">
      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
        <Panel className="text-center">
          <QrCode size={48} className="mx-auto text-accent-light mb-4" />
          <h3 className="text-sm font-medium text-white">Scan Event QR</h3>
          <p className="text-xs text-ink-400 mt-2 mb-4">Point camera at organizer QR code to verify attendance</p>
          <Button className="w-full">Open Scanner</Button>
        </Panel>
        <Panel className="text-center">
          <MapPin size={48} className="mx-auto text-gold mb-4" />
          <h3 className="text-sm font-medium text-white">Geo Check-in</h3>
          <p className="text-xs text-ink-400 mt-2 mb-4">Enable location for offline event verification</p>
          <Button variant="secondary" className="w-full">Verify Location</Button>
        </Panel>
      </div>
    </RoleShell>
  );
}
