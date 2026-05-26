"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Can } from "@/components/auth/Can";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";

type Record = {
  id: string;
  volunteer: string;
  event: string;
  org: string;
  method: string;
  suspicious: boolean;
  createdAt: string;
};

export default function AdminAttendancePage() {
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [configs, setConfigs] = useState<{ eventTitle: string; org: string; hasGeo: boolean }[]>([]);

  useEffect(() => {
    api.adminAttendance({ suspicious: suspiciousOnly ? "true" : "" }).then((r) => {
      setRecords(r.records as Record[]);
      setConfigs(r.eventConfigs as { eventTitle: string; org: string; hasGeo: boolean }[]);
    }).catch(console.error);
  }, [suspiciousOnly]);

  const columns: AdminColumn<Record>[] = [
    { key: "volunteer", header: "Volunteer", render: (r) => <span className="text-white">{r.volunteer}</span> },
    { key: "event", header: "Event", render: (r) => r.event },
    { key: "method", header: "Method", render: (r) => r.method },
    { key: "risk", header: "Risk", render: (r) => (r.suspicious ? <StatusBadge status="flagged" /> : "OK") },
    { key: "time", header: "Time", render: (r) => new Date(r.createdAt).toLocaleString() },
  ];

  return (
    <RoleShell role="admin" title="Attendance Monitor" subtitle="QR · Geo · Fraud detection">
      <Can permission="verification.monitor">
        <AdminFilters
          fields={[
            {
              key: "suspicious",
              label: "Filter",
              type: "select",
              value: suspiciousOnly ? "yes" : "no",
              options: [
                { value: "no", label: "All check-ins" },
                { value: "yes", label: "Suspicious only" },
              ],
            },
          ]}
          onChange={(k, v) => k === "suspicious" && setSuspiciousOnly(v === "yes")}
        />
        <Panel className="mb-4">
          <p className="text-xs text-ink-500 uppercase mb-2">Event attendance configs</p>
          <div className="flex flex-wrap gap-2">
            {configs.slice(0, 8).map((c, i) => (
              <span key={i} className="text-xs text-ink-300 bg-white/[0.04] px-2 py-1 rounded-lg">
                {c.eventTitle} · Geo {c.hasGeo ? "on" : "off"}
              </span>
            ))}
          </div>
        </Panel>
        <AdminTable columns={columns} data={records} keyField="id" emptyMessage="No attendance records." />
      </Can>
    </RoleShell>
  );
}
