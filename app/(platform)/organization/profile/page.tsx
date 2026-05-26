"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/dashboard/RoleShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { api } from "@/lib/api/client";

export default function OrgProfilePage() {
  const [org, setOrg] = useState<{ name: string; logo: string; description: string | null; verified: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => api.orgProfile().then((r) => setOrg(r.organization)).catch(console.error);

  useEffect(() => { load(); }, []);

  async function handleEdit() {
    if (!org) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const name = window.prompt("Organization name", org.name);
      if (!name) return;
      const description = window.prompt("Description", org.description ?? "") ?? org.description;
      const logo = window.prompt("Logo initials (2 chars)", org.logo) ?? org.logo;
      await api.updateOrgProfile({ name, description: description ?? undefined, logo });
      setSuccess("Profile updated");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleShell role="organization" title="Organization Profile" subtitle="Public identity · Verification">
      <Panel className="max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gold/10 flex items-center justify-center text-lg font-semibold text-gold">{org?.logo ?? "—"}</div>
          <div>
            <p className="text-lg font-medium text-white">{org?.name ?? "…"}</p>
            <p className="text-xs text-emerald-400">{org?.verified ? "Verified Organization" : "Pending verification"}</p>
          </div>
        </div>
        <p className="text-sm text-ink-300">{org?.description}</p>
        <Button variant="secondary" size="sm" className="mt-6" onClick={handleEdit} disabled={loading}>
          {loading ? "Saving…" : "Edit Profile"}
        </Button>
        <ActionFeedback loading={loading} error={error} success={success} />
      </Panel>
    </RoleShell>
  );
}
