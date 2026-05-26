"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings ?? []))
      .catch(console.error);
  }, []);

  return (
    <RoleShell role="admin" title="System Settings" subtitle="Platform configuration">
      <Panel className="max-w-lg divide-y divide-white/[0.04] !p-0">
        {settings.map((s) => (
          <div key={s.key} className="flex justify-between px-5 py-4">
            <span className="text-sm text-ink-300">{s.key}</span>
            <span className="text-sm text-white font-mono text-xs">{s.value}</span>
          </div>
        ))}
      </Panel>
    </RoleShell>
  );
}
