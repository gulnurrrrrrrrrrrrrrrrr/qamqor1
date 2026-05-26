"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Can } from "@/components/auth/Can";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  useEffect(() => {
    api.adminSettings().then((r) => setSettings(r.settings)).catch(console.error);
  }, []);

  async function save() {
    setLoading(true);
    setMsg({});
    try {
      const res = await api.updateAdminSettings(settings);
      setSettings(res.settings);
      setMsg({ success: "Settings saved" });
    } catch (e) {
      setMsg({ error: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleShell role="admin" title="System Settings" subtitle="Trust · Verification · Platform flags">
      <Can permission="settings.system">
        <ActionFeedback loading={loading} error={msg.error} success={msg.success} />
        <Panel className="max-w-lg !p-0 overflow-hidden mb-4">
          {settings.map((s, i) => (
            <div key={s.key} className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-4 border-b border-white/[0.04] last:border-0">
              <span className="text-sm text-ink-300 sm:w-48">{s.key}</span>
              <input
                className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-sm text-white"
                value={s.value}
                onChange={(e) => {
                  const next = [...settings];
                  next[i] = { ...s, value: e.target.value };
                  setSettings(next);
                }}
              />
            </div>
          ))}
        </Panel>
        <Button onClick={save} disabled={loading}>{loading ? "Saving…" : "Save settings"}</Button>
      </Can>
    </RoleShell>
  );
}
