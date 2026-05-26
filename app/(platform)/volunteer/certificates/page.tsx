"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/lib/api/client";

export default function CertificatesPage() {
  const [certs, setCerts] = useState<{ id: string; name: string; issuer: string; date: string }[]>([]);
  const [hours, setHours] = useState(0);

  useEffect(() => {
    api.volunteerDashboard().then((d) => {
      setCerts(d.certificates);
      setHours(d.stats.impactHours);
    }).catch(console.error);
  }, []);

  return (
    <RoleShell role="volunteer" title="Certificates" subtitle={`${hours} verified hours`}>
      <div className="grid sm:grid-cols-2 gap-4">
        {certs.map((c) => (
          <Panel key={c.id}>
            <p className="text-sm font-medium text-white">{c.name}</p>
            <p className="text-xs text-ink-400 mt-1">{c.issuer} · {c.date}</p>
            <span className="inline-block mt-3 text-[10px] uppercase text-emerald-400">Platform Verified</span>
          </Panel>
        ))}
      </div>
    </RoleShell>
  );
}
